namespace Ecommerce.Modules.Coupons.Contracts;

public sealed record CouponDto(
    Guid Id,
    string Code,
    string Title,
    string? Description,
    decimal DiscountPercent,
    decimal? MaxDiscountAmount,
    decimal MinOrderSubtotal,
    int? UsageLimit,
    int UsageCount,
    int? PerUserLimit,
    DateTimeOffset? ValidUntil,
    bool IsActive);

public sealed record CreateCouponRequest(
    string Code,
    string Title,
    string? Description,
    decimal DiscountPercent,
    decimal? MaxDiscountAmount,
    decimal MinOrderSubtotal,
    int? UsageLimit,
    int? PerUserLimit,
    DateTimeOffset? ValidUntil);

public sealed record UpdateCouponRequest(
    string Title,
    string? Description,
    decimal DiscountPercent,
    decimal? MaxDiscountAmount,
    decimal MinOrderSubtotal,
    int? UsageLimit,
    int? PerUserLimit,
    DateTimeOffset? ValidUntil,
    bool IsActive);

public sealed record ApplyCouponPreviewRequest(string Code, decimal Subtotal);

public sealed record ApplyCouponPreviewResponse(bool IsValid, string? ErrorMessage, decimal DiscountAmount);

/// <summary>Result of an authoritative, in-transaction redemption attempt during checkout.</summary>
public sealed record CouponRedemptionResult(bool Success, string? ErrorMessage, decimal DiscountAmount);
