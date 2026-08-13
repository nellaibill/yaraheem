namespace Ecommerce.Modules.Identity.Contracts;

public sealed record RequestOtpRequest(string PhoneNumber);

public sealed record RequestOtpResponse(
    /// <summary>Only populated outside Production, so local/dev testing doesn't need a real phone/SMS account. Never sent in Production.</summary>
    string? DevOnlyCode);

public sealed record VerifyOtpRequest(string PhoneNumber, string Code);

public sealed record VerifyOtpResponse(bool Verified);
