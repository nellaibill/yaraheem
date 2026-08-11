namespace Ecommerce.Shared.Kernel;

public sealed record ApiResponse<T>(bool Success, string Message, T? Data)
{
    public static ApiResponse<T> SuccessResponse(T data, string message = "") => new(true, message, data);
}
