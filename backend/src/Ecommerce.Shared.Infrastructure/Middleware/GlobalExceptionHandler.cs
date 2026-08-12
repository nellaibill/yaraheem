using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Ecommerce.Shared.Infrastructure.Middleware;

public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger, IHostEnvironment environment) : IExceptionHandler
{
    private const string GenericServerErrorDetail = "An unexpected error occurred. Please try again or contact support if the problem persists.";

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (statusCode, title) = exception switch
        {
            NotFoundException => (StatusCodes.Status404NotFound, "Resource not found"),
            ConflictException => (StatusCodes.Status409Conflict, "Conflict"),
            ForbiddenException => (StatusCodes.Status403Forbidden, "Forbidden"),
            UnauthorizedAppException => (StatusCodes.Status401Unauthorized, "Unauthorized"),
            DomainValidationException => (StatusCodes.Status400BadRequest, "Validation failed"),
            FluentValidation.ValidationException => (StatusCodes.Status400BadRequest, "Validation failed"),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred"),
        };

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "Unhandled exception processing {Method} {Path}", httpContext.Request.Method, httpContext.Request.Path);
        }
        else
        {
            logger.LogWarning(exception, "Handled exception {ExceptionType} processing {Method} {Path}", exception.GetType().Name, httpContext.Request.Method, httpContext.Request.Path);
        }

        // Known exception types (404/409/403/401/validation) carry intentionally
        // user-facing messages and are always safe to return as-is. Unhandled 500s can carry
        // raw internal detail (EF Core/Npgsql text, null-reference messages, etc.) that must
        // never reach a client outside Development.
        var detail = statusCode == StatusCodes.Status500InternalServerError && !environment.IsDevelopment()
            ? GenericServerErrorDetail
            : exception.Message;

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail,
            Instance = httpContext.Request.Path,
        };

        if (exception is DomainValidationException domainValidation)
        {
            problemDetails.Extensions["errors"] = domainValidation.Errors;
        }
        else if (exception is FluentValidation.ValidationException fluentValidation)
        {
            problemDetails.Extensions["errors"] = fluentValidation.Errors
                .GroupBy(e => e.PropertyName)
                .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());
        }

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
        return true;
    }
}
