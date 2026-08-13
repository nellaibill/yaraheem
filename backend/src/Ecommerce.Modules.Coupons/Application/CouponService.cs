using Ecommerce.Modules.Audit.Application;
using Ecommerce.Modules.Coupons.Contracts;
using Ecommerce.Modules.Coupons.Domain;
using Ecommerce.Modules.Coupons.Infrastructure;
using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Coupons.Application;

/// <summary>
/// auditLog is optional because OrderService constructs a throwaway instance of this class
/// bound to a transaction-scoped DbContext during checkout (see TryRedeemAsync callers) —
/// that path doesn't want a redemption to itself generate an admin audit entry, only the
/// admin CRUD paths (resolved normally via DI, with auditLog populated) do.
/// </summary>
public sealed class CouponService(CouponsDbContext db, IAuditLogService? auditLog = null) : ICouponService
{
    public async Task<ApplyCouponPreviewResponse> PreviewAsync(Guid userId, string code, decimal subtotal, CancellationToken cancellationToken)
    {
        var normalizedCode = code.Trim().ToUpperInvariant();
        var coupon = await db.Coupons.AsNoTracking().FirstOrDefaultAsync(c => c.Code == normalizedCode, cancellationToken);
        if (coupon is null)
        {
            return new ApplyCouponPreviewResponse(false, "Coupon code not found.", 0m);
        }

        var userRedemptionCount = coupon.PerUserLimit.HasValue
            ? await db.CouponRedemptions.CountAsync(r => r.CouponId == coupon.Id && r.UserId == userId, cancellationToken)
            : 0;

        var error = Validate(coupon, subtotal, userRedemptionCount);
        if (error is not null)
        {
            return new ApplyCouponPreviewResponse(false, error, 0m);
        }

        return new ApplyCouponPreviewResponse(true, null, CalculateDiscount(coupon, subtotal));
    }

    public async Task<CouponRedemptionResult> TryRedeemAsync(Guid userId, string code, decimal subtotal, Guid orderId, CancellationToken cancellationToken)
    {
        var normalizedCode = code.Trim().ToUpperInvariant();

        // Lock the coupon row for the rest of the caller's transaction so two concurrent
        // checkouts racing against the last remaining use of a limited coupon can't both
        // read "under the limit" and both redeem it.
        var couponId = await db.Coupons.AsNoTracking()
            .Where(c => c.Code == normalizedCode)
            .Select(c => (Guid?)c.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (couponId is null)
        {
            return new CouponRedemptionResult(false, "Coupon code not found.", 0m);
        }

        await db.Database.SqlQueryRaw<int>(
            $"SELECT 1 FROM {CouponsDbContext.Schema}.coupons WHERE id = @p0 FOR UPDATE",
            couponId.Value).ToListAsync(cancellationToken);

        var coupon = await db.Coupons.FirstAsync(c => c.Id == couponId.Value, cancellationToken);

        var userRedemptionCount = coupon.PerUserLimit.HasValue
            ? await db.CouponRedemptions.CountAsync(r => r.CouponId == coupon.Id && r.UserId == userId, cancellationToken)
            : 0;

        var error = Validate(coupon, subtotal, userRedemptionCount);
        if (error is not null)
        {
            return new CouponRedemptionResult(false, error, 0m);
        }

        var discount = CalculateDiscount(coupon, subtotal);

        coupon.UsageCount += 1;
        db.CouponRedemptions.Add(new CouponRedemption
        {
            CouponId = coupon.Id,
            UserId = userId,
            OrderId = orderId,
            DiscountAmount = discount,
        });

        await db.SaveChangesAsync(cancellationToken);

        return new CouponRedemptionResult(true, null, discount);
    }

    public async Task<IReadOnlyList<CouponDto>> GetAllAsync(CancellationToken cancellationToken)
    {
        var coupons = await db.Coupons.AsNoTracking().OrderByDescending(c => c.CreatedAt).ToListAsync(cancellationToken);
        return coupons.Select(ToDto).ToList();
    }

    public async Task<CouponDto> CreateAsync(CreateCouponRequest request, CancellationToken cancellationToken)
    {
        var normalizedCode = request.Code.Trim().ToUpperInvariant();
        var exists = await db.Coupons.AnyAsync(c => c.Code == normalizedCode, cancellationToken);
        if (exists)
        {
            throw new ConflictException($"A coupon with code '{normalizedCode}' already exists.");
        }

        var coupon = new Coupon
        {
            Code = normalizedCode,
            Title = request.Title,
            Description = request.Description,
            DiscountPercent = request.DiscountPercent,
            MaxDiscountAmount = request.MaxDiscountAmount,
            MinOrderSubtotal = request.MinOrderSubtotal,
            UsageLimit = request.UsageLimit,
            PerUserLimit = request.PerUserLimit,
            ValidUntil = request.ValidUntil,
        };

        db.Coupons.Add(coupon);
        await db.SaveChangesAsync(cancellationToken);

        if (auditLog is not null)
        {
            await auditLog.LogAsync("Coupon.Created", "Coupon", coupon.Id.ToString(), $"Created '{coupon.Code}'", cancellationToken);
        }

        return ToDto(coupon);
    }

    public async Task<CouponDto> UpdateAsync(Guid id, UpdateCouponRequest request, CancellationToken cancellationToken)
    {
        var coupon = await db.Coupons.FirstOrDefaultAsync(c => c.Id == id, cancellationToken)
                     ?? throw new NotFoundException("Coupon", id);

        coupon.Title = request.Title;
        coupon.Description = request.Description;
        coupon.DiscountPercent = request.DiscountPercent;
        coupon.MaxDiscountAmount = request.MaxDiscountAmount;
        coupon.MinOrderSubtotal = request.MinOrderSubtotal;
        coupon.UsageLimit = request.UsageLimit;
        coupon.PerUserLimit = request.PerUserLimit;
        coupon.ValidUntil = request.ValidUntil;
        coupon.IsActive = request.IsActive;

        await db.SaveChangesAsync(cancellationToken);

        if (auditLog is not null)
        {
            await auditLog.LogAsync("Coupon.Updated", "Coupon", coupon.Id.ToString(), $"Updated '{coupon.Code}'", cancellationToken);
        }

        return ToDto(coupon);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var coupon = await db.Coupons.FirstOrDefaultAsync(c => c.Id == id, cancellationToken)
                     ?? throw new NotFoundException("Coupon", id);

        db.Coupons.Remove(coupon);
        await db.SaveChangesAsync(cancellationToken);

        if (auditLog is not null)
        {
            await auditLog.LogAsync("Coupon.Deleted", "Coupon", id.ToString(), $"Deleted '{coupon.Code}'", cancellationToken);
        }
    }

    private static string? Validate(Coupon coupon, decimal subtotal, int userRedemptionCount)
    {
        if (!coupon.IsActive)
        {
            return "This coupon is no longer active.";
        }

        if (coupon.ValidUntil.HasValue && coupon.ValidUntil.Value < DateTimeOffset.UtcNow)
        {
            return "This coupon has expired.";
        }

        if (subtotal < coupon.MinOrderSubtotal)
        {
            return $"This coupon requires a minimum order of {coupon.MinOrderSubtotal:0}.";
        }

        if (coupon.UsageLimit.HasValue && coupon.UsageCount >= coupon.UsageLimit.Value)
        {
            return "This coupon has reached its usage limit.";
        }

        if (coupon.PerUserLimit.HasValue && userRedemptionCount >= coupon.PerUserLimit.Value)
        {
            return "You've already used this coupon the maximum number of times.";
        }

        return null;
    }

    private static decimal CalculateDiscount(Coupon coupon, decimal subtotal)
    {
        var raw = subtotal * coupon.DiscountPercent / 100m;
        return coupon.MaxDiscountAmount.HasValue ? Math.Min(raw, coupon.MaxDiscountAmount.Value) : raw;
    }

    private static CouponDto ToDto(Coupon c) => new(
        c.Id, c.Code, c.Title, c.Description, c.DiscountPercent, c.MaxDiscountAmount, c.MinOrderSubtotal,
        c.UsageLimit, c.UsageCount, c.PerUserLimit, c.ValidUntil, c.IsActive);
}
