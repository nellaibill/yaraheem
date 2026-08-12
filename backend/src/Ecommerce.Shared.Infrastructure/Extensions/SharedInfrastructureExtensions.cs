using System.Text;
using Ecommerce.Shared.Infrastructure.Options;
using Ecommerce.Shared.Infrastructure.Security;
using Ecommerce.Shared.Kernel;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

namespace Ecommerce.Shared.Infrastructure.Extensions;

public static class SharedInfrastructureExtensions
{
    public static IServiceCollection AddSharedInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.Configure<CorsOptions>(configuration.GetSection(CorsOptions.SectionName));
        services.Configure<SerilogOptions>(configuration.GetSection(SerilogOptions.SectionName));
        services.Configure<AdminSeedOptions>(configuration.GetSection(AdminSeedOptions.SectionName));

        services.AddHttpContextAccessor();
        services.AddScoped<ICurrentUser, CurrentUser>();
        services.AddSingleton<ITokenService, TokenService>();
        services.AddSingleton<IPasswordHasher, PasswordHasher>();

        services.AddExceptionHandler<Middleware.GlobalExceptionHandler>();
        services.AddProblemDetails();

        var jwt = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
                  ?? throw new InvalidOperationException("Jwt configuration section is missing.");

        if (string.IsNullOrWhiteSpace(jwt.SigningKey) || jwt.SigningKey.Length < 32)
        {
            throw new InvalidOperationException(
                "Jwt:SigningKey is missing or shorter than 32 characters. Set it via user-secrets (dev) or the " +
                "Jwt__SigningKey environment variable — see backend/SECRETS.md. Refusing to start with a weak or absent signing key.");
        }

        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwt.Issuer,
                    ValidAudience = jwt.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.SigningKey)),
                    ClockSkew = TimeSpan.FromSeconds(30),
                };
            });

        services.AddAuthorization();

        return services;
    }

    public static IServiceCollection AddSharedCors(this IServiceCollection services, IConfiguration configuration)
    {
        var corsOptions = configuration.GetSection(CorsOptions.SectionName).Get<CorsOptions>() ?? new CorsOptions();

        services.AddCors(options =>
        {
            options.AddPolicy("Default", policy =>
            {
                if (corsOptions.AllowedOrigins.Length > 0)
                {
                    policy.WithOrigins(corsOptions.AllowedOrigins)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                }
                else
                {
                    // Fail closed: no configured origins means no cross-origin requests are
                    // allowed at all, not "allow anything." A previous version of this policy
                    // fell back to reflecting any origin with credentials enabled, which is a
                    // wide-open CORS hole if Cors:AllowedOrigins is ever missing/blank.
                    Console.Error.WriteLine(
                        "WARNING: Cors:AllowedOrigins is empty — denying all cross-origin requests. " +
                        "Set Cors:AllowedOrigins to enable the frontend(s) that need API access.");
                    policy.WithOrigins(Array.Empty<string>()).AllowAnyHeader().AllowAnyMethod();
                }
            });
        });

        return services;
    }
}
