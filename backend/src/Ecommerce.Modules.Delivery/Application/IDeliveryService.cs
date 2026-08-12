using Ecommerce.Modules.Delivery.Contracts;

namespace Ecommerce.Modules.Delivery.Application;

public interface IDeliveryService
{
    Task<IReadOnlyList<DeliveryPartnerDto>> GetPartnersAsync(CancellationToken cancellationToken);
    Task<DeliveryPartnerDto> CreatePartnerAsync(CreateDeliveryPartnerRequest request, CancellationToken cancellationToken);
    Task<DeliveryPartnerDto> UpdatePartnerAsync(Guid partnerId, UpdateDeliveryPartnerRequest request, CancellationToken cancellationToken);
    Task<OrderAssignmentDto> AssignOrderAsync(Guid orderId, Guid deliveryPartnerId, CancellationToken cancellationToken);
    Task<OrderAssignmentDto?> GetAssignmentAsync(Guid orderId, CancellationToken cancellationToken);
    Task<IReadOnlyList<MyDeliveryOrderDto>> GetMyOrdersAsync(Guid partnerUserId, CancellationToken cancellationToken);
    Task<MyDeliveryOrderDto> UpdateAssignmentStatusAsync(Guid orderId, Guid partnerUserId, Domain.DeliveryAssignmentStatus newStatus, CancellationToken cancellationToken);
}
