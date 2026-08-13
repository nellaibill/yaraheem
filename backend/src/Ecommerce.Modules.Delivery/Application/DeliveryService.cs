using Ecommerce.Modules.Audit.Application;
using Ecommerce.Modules.Delivery.Contracts;
using Ecommerce.Modules.Delivery.Domain;
using Ecommerce.Modules.Delivery.Infrastructure;
using Ecommerce.Modules.Identity.Domain;
using Ecommerce.Modules.Identity.Infrastructure;
using Ecommerce.Modules.Orders.Application;
using Ecommerce.Modules.Orders.Contracts;
using Ecommerce.Modules.Orders.Domain;
using Ecommerce.Modules.Orders.Infrastructure;
using Ecommerce.Shared.Infrastructure.Security;
using Ecommerce.Shared.Kernel.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace Ecommerce.Modules.Delivery.Application;

public sealed class DeliveryService(
    DeliveryDbContext db,
    IdentityDbContext identityDb,
    OrdersDbContext ordersDb,
    IOrderService orderService,
    IPasswordHasher passwordHasher,
    IDeliveryAssignmentTransitionService transitionService,
    IAuditLogService auditLog) : IDeliveryService
{
    public async Task<IReadOnlyList<DeliveryPartnerDto>> GetPartnersAsync(CancellationToken cancellationToken)
    {
        var partners = await db.DeliveryPartners.AsNoTracking().OrderBy(p => p.Name).ToListAsync(cancellationToken);
        var userIds = partners.Select(p => p.UserId).ToList();
        var emails = await identityDb.Users.AsNoTracking()
            .Where(u => userIds.Contains(u.Id))
            .ToDictionaryAsync(u => u.Id, u => u.Email, cancellationToken);

        return partners.Select(p => ToDto(p, emails.GetValueOrDefault(p.UserId, string.Empty))).ToList();
    }

    public async Task<DeliveryPartnerDto> CreatePartnerAsync(CreateDeliveryPartnerRequest request, CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var emailTaken = await identityDb.Users.AnyAsync(u => u.Email == normalizedEmail, cancellationToken);
        if (emailTaken)
        {
            throw new ConflictException($"A user with email '{normalizedEmail}' already exists.");
        }

        var role = await identityDb.Roles.FirstOrDefaultAsync(r => r.NormalizedName == Role.WellKnown.DeliveryPartner.ToUpperInvariant(), cancellationToken)
                   ?? throw new InvalidOperationException("DeliveryPartner role is not seeded.");

        var nameParts = request.Name.Trim().Split(' ', 2);
        var user = new User
        {
            Email = normalizedEmail,
            PasswordHash = passwordHasher.Hash(request.Password),
            FirstName = nameParts[0],
            LastName = nameParts.Length > 1 ? nameParts[1] : string.Empty,
            PhoneNumber = request.PhoneNumber,
        };
        user.UserRoles.Add(new UserRole { UserId = user.Id, RoleId = role.Id });
        identityDb.Users.Add(user);
        await identityDb.SaveChangesAsync(cancellationToken);

        var partner = new DeliveryPartner
        {
            UserId = user.Id,
            Name = request.Name,
            PhoneNumber = request.PhoneNumber,
            VehicleType = request.VehicleType,
            Status = DeliveryPartnerStatus.Available,
        };
        db.DeliveryPartners.Add(partner);
        await db.SaveChangesAsync(cancellationToken);

        await auditLog.LogAsync("DeliveryPartner.Created", "DeliveryPartner", partner.Id.ToString(), $"Created '{partner.Name}' ({user.Email})", cancellationToken);

        return ToDto(partner, user.Email);
    }

    public async Task<DeliveryPartnerDto> UpdatePartnerAsync(Guid partnerId, UpdateDeliveryPartnerRequest request, CancellationToken cancellationToken)
    {
        var partner = await db.DeliveryPartners.FirstOrDefaultAsync(p => p.Id == partnerId, cancellationToken)
                       ?? throw new NotFoundException("DeliveryPartner", partnerId);

        partner.Name = request.Name;
        partner.PhoneNumber = request.PhoneNumber;
        partner.VehicleType = request.VehicleType;
        partner.Status = request.Status;

        await db.SaveChangesAsync(cancellationToken);

        await auditLog.LogAsync("DeliveryPartner.Updated", "DeliveryPartner", partner.Id.ToString(), $"Updated '{partner.Name}'", cancellationToken);

        var email = await identityDb.Users.AsNoTracking().Where(u => u.Id == partner.UserId).Select(u => u.Email).FirstOrDefaultAsync(cancellationToken);
        return ToDto(partner, email ?? string.Empty);
    }

    public async Task<OrderAssignmentDto> AssignOrderAsync(Guid orderId, Guid deliveryPartnerId, CancellationToken cancellationToken)
    {
        var orderExists = await ordersDb.Orders.AnyAsync(o => o.Id == orderId, cancellationToken);
        if (!orderExists)
        {
            throw new NotFoundException("Order", orderId);
        }

        var partner = await db.DeliveryPartners.AsNoTracking().FirstOrDefaultAsync(p => p.Id == deliveryPartnerId, cancellationToken)
                       ?? throw new NotFoundException("DeliveryPartner", deliveryPartnerId);

        var assignment = await db.OrderDeliveryAssignments.FirstOrDefaultAsync(a => a.OrderId == orderId, cancellationToken);
        if (assignment is null)
        {
            assignment = new OrderDeliveryAssignment { OrderId = orderId, DeliveryPartnerId = deliveryPartnerId };
            db.OrderDeliveryAssignments.Add(assignment);
        }
        else
        {
            assignment.DeliveryPartnerId = deliveryPartnerId;
            assignment.Status = DeliveryAssignmentStatus.Assigned;
            assignment.AssignedAt = DateTimeOffset.UtcNow;
        }

        await db.SaveChangesAsync(cancellationToken);

        await auditLog.LogAsync("DeliveryAssignment.Created", "Order", orderId.ToString(), $"Assigned to '{partner.Name}'", cancellationToken);

        return new OrderAssignmentDto(orderId, partner.Id, partner.Name, assignment.Status, assignment.AssignedAt);
    }

    public async Task<OrderAssignmentDto?> GetAssignmentAsync(Guid orderId, CancellationToken cancellationToken)
    {
        var assignment = await db.OrderDeliveryAssignments.AsNoTracking().FirstOrDefaultAsync(a => a.OrderId == orderId, cancellationToken);
        if (assignment is null)
        {
            return null;
        }

        var partner = await db.DeliveryPartners.AsNoTracking().FirstOrDefaultAsync(p => p.Id == assignment.DeliveryPartnerId, cancellationToken);
        return new OrderAssignmentDto(orderId, assignment.DeliveryPartnerId, partner?.Name, assignment.Status, assignment.AssignedAt);
    }

    public async Task<IReadOnlyList<MyDeliveryOrderDto>> GetMyOrdersAsync(Guid partnerUserId, CancellationToken cancellationToken)
    {
        var partner = await db.DeliveryPartners.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == partnerUserId, cancellationToken)
                       ?? throw new NotFoundException("DeliveryPartner", partnerUserId);

        var assignments = await db.OrderDeliveryAssignments.AsNoTracking()
            .Where(a => a.DeliveryPartnerId == partner.Id)
            .OrderByDescending(a => a.AssignedAt)
            .ToListAsync(cancellationToken);

        var orderIds = assignments.Select(a => a.OrderId).ToList();
        var orders = await ordersDb.Orders.AsNoTracking()
            .Include(o => o.ShippingAddress)
            .Include(o => o.Items)
            .Where(o => orderIds.Contains(o.Id))
            .ToDictionaryAsync(o => o.Id, cancellationToken);

        var result = new List<MyDeliveryOrderDto>();
        foreach (var assignment in assignments)
        {
            if (!orders.TryGetValue(assignment.OrderId, out var order))
            {
                continue;
            }

            result.Add(new MyDeliveryOrderDto(
                order.Id, order.OrderNumber, assignment.Status,
                order.ShippingAddress.FullName, order.ShippingAddress.PhoneNumber,
                order.ShippingAddress.AddressLine1, order.ShippingAddress.AddressLine2,
                order.ShippingAddress.City, order.ShippingAddress.State, order.ShippingAddress.PostalCode,
                order.Items.Select(i => new DeliveryOrderItemDto(i.ProductName, i.Quantity)).ToList(),
                order.Total, assignment.AssignedAt));
        }

        return result;
    }

    public async Task<MyDeliveryOrderDto> UpdateAssignmentStatusAsync(Guid orderId, Guid partnerUserId, DeliveryAssignmentStatus newStatus, CancellationToken cancellationToken)
    {
        var partner = await db.DeliveryPartners.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == partnerUserId, cancellationToken)
                       ?? throw new NotFoundException("DeliveryPartner", partnerUserId);

        var assignment = await db.OrderDeliveryAssignments.FirstOrDefaultAsync(a => a.OrderId == orderId, cancellationToken)
                          ?? throw new NotFoundException("OrderDeliveryAssignment", orderId);

        if (assignment.DeliveryPartnerId != partner.Id)
        {
            throw new ForbiddenException("This order is not assigned to you.");
        }

        transitionService.EnsureValidTransition(assignment.Status, newStatus);
        assignment.Status = newStatus;
        await db.SaveChangesAsync(cancellationToken);

        await auditLog.LogAsync("DeliveryAssignment.StatusChanged", "Order", orderId.ToString(), $"-> {newStatus}", cancellationToken);

        await SyncOrderStatusAsync(orderId, newStatus, partnerUserId, cancellationToken);

        var order = await ordersDb.Orders.AsNoTracking()
            .Include(o => o.ShippingAddress)
            .Include(o => o.Items)
            .FirstAsync(o => o.Id == orderId, cancellationToken);

        return new MyDeliveryOrderDto(
            order.Id, order.OrderNumber, assignment.Status,
            order.ShippingAddress.FullName, order.ShippingAddress.PhoneNumber,
            order.ShippingAddress.AddressLine1, order.ShippingAddress.AddressLine2,
            order.ShippingAddress.City, order.ShippingAddress.State, order.ShippingAddress.PostalCode,
            order.Items.Select(i => new DeliveryOrderItemDto(i.ProductName, i.Quantity)).ToList(),
            order.Total, assignment.AssignedAt);
    }

    /// <summary>
    /// Maps the rider-facing assignment state onto the customer-facing Order.Status so
    /// OrderTrackingPage reflects delivery progress. PickedUp/OutForDelivery both collapse
    /// onto "Shipped" (Order has no separate rider sub-states); Delivered maps 1:1.
    /// OrderStatusTransitionService only allows single-step transitions (e.g. an order an
    /// admin assigned straight from "Confirmed" hasn't passed through "Processing" yet), so
    /// this walks the linear Pending→Confirmed→Processing→Shipped→Delivered chain one step
    /// at a time rather than jumping straight to the target. Skips entirely once the order is
    /// already at/past the target, or terminal (Delivered/Cancelled).
    /// </summary>
    private async Task SyncOrderStatusAsync(Guid orderId, DeliveryAssignmentStatus assignmentStatus, Guid changedByUserId, CancellationToken cancellationToken)
    {
        OrderStatus? targetStatus = assignmentStatus switch
        {
            DeliveryAssignmentStatus.PickedUp => OrderStatus.Shipped,
            DeliveryAssignmentStatus.Delivered => OrderStatus.Delivered,
            _ => null,
        };

        if (targetStatus is null)
        {
            return;
        }

        var currentStatus = await ordersDb.Orders.AsNoTracking().Where(o => o.Id == orderId).Select(o => o.Status).FirstAsync(cancellationToken);
        if (currentStatus >= targetStatus.Value || currentStatus == OrderStatus.Cancelled)
        {
            return;
        }

        while (currentStatus < targetStatus.Value)
        {
            var next = (OrderStatus)((int)currentStatus + 1);
            await orderService.UpdateStatusAsync(
                orderId,
                new UpdateOrderStatusRequest(next, $"Delivery status: {assignmentStatus}"),
                changedByUserId,
                cancellationToken);
            currentStatus = next;
        }
    }

    private static DeliveryPartnerDto ToDto(DeliveryPartner p, string email) =>
        new(p.Id, p.Name, p.PhoneNumber, p.VehicleType, p.Status, email);
}
