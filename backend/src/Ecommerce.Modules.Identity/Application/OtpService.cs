using System.Security.Cryptography;
using System.Text;
using Ecommerce.Modules.Identity.Contracts;
using Ecommerce.Modules.Identity.Domain;
using Ecommerce.Modules.Identity.Infrastructure;
using Ecommerce.Shared.Infrastructure.Sms;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;

namespace Ecommerce.Modules.Identity.Application;

public sealed class OtpService(IdentityDbContext db, ISmsSender smsSender, IHostEnvironment environment) : IOtpService
{
    private const int OtpExpiryMinutes = 5;
    private const int OtpLength = 6;

    public async Task<RequestOtpResponse> RequestAsync(string phoneNumber, CancellationToken cancellationToken)
    {
        var code = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString($"D{OtpLength}");

        db.OtpChallenges.Add(new OtpChallenge
        {
            PhoneNumber = phoneNumber,
            CodeHash = HashCode(code),
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(OtpExpiryMinutes),
        });
        await db.SaveChangesAsync(cancellationToken);

        await smsSender.SendAsync(
            phoneNumber,
            $"Your Ya Raheem OTP is {code}. It expires in {OtpExpiryMinutes} minutes. Do not share this code with anyone.",
            cancellationToken);

        return new RequestOtpResponse(environment.IsDevelopment() ? code : null);
    }

    public async Task<VerifyOtpResponse> VerifyAsync(string phoneNumber, string code, CancellationToken cancellationToken)
    {
        var challenge = await db.OtpChallenges
            .Where(o => o.PhoneNumber == phoneNumber)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (challenge is null || !challenge.IsActive)
        {
            return new VerifyOtpResponse(false);
        }

        if (challenge.CodeHash != HashCode(code))
        {
            challenge.FailedAttempts += 1;
            await db.SaveChangesAsync(cancellationToken);
            return new VerifyOtpResponse(false);
        }

        challenge.VerifiedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        return new VerifyOtpResponse(true);
    }

    private static string HashCode(string code) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(code)));
}
