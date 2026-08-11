namespace Ecommerce.Shared.Kernel.Exceptions;

public abstract class AppException(string message) : Exception(message);

public sealed class NotFoundException(string entity, object key)
    : AppException($"{entity} with key '{key}' was not found.");

public sealed class ConflictException(string message) : AppException(message);

public sealed class ForbiddenException(string message = "You do not have permission to perform this action.")
    : AppException(message);

public sealed class UnauthorizedAppException(string message = "Authentication failed.") : AppException(message);

public sealed class DomainValidationException(IReadOnlyDictionary<string, string[]> errors)
    : AppException("One or more validation errors occurred.")
{
    public IReadOnlyDictionary<string, string[]> Errors { get; } = errors;
}
