using Ecommerce.Modules.Coupons.Contracts;

namespace Ecommerce.Modules.Coupons.Application;

public interface ICouponService
{
    /// <summary>Read-only check used by the cart/checkout UI before the customer commits to an order.</summary>
    Task<ApplyCouponPreviewResponse> PreviewAsync(Guid userId, string code, decimal subtotal, CancellationToken cancellationToken);

    /// <summary>
    /// Authoritative, row-locked validate-and-redeem — call only from within the checkout
    /// transaction (see OrderService.CheckoutAsync), never standalone, so the usage-limit
    /// check and the increment happen atomically under concurrent checkouts.
    /// </summary>
    Task<CouponRedemptionResult> TryRedeemAsync(Guid userId, string code, decimal subtotal, Guid orderId, CancellationToken cancellationToken);

    Task<IReadOnlyList<CouponDto>> GetAllAsync(CancellationToken cancellationToken);
    Task<CouponDto> CreateAsync(CreateCouponRequest request, CancellationToken cancellationToken);
    Task<CouponDto> UpdateAsync(Guid id, UpdateCouponRequest request, CancellationToken cancellationToken);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken);
}
