using Ecommerce.Modules.Delivery.Application;
using Ecommerce.Modules.Delivery.Domain;
using Ecommerce.Shared.Kernel.Exceptions;
using Xunit;

namespace Ecommerce.Tests;

public class DeliveryAssignmentTransitionServiceTests
{
    private readonly DeliveryAssignmentTransitionService _service = new();

    [Theory]
    [InlineData(DeliveryAssignmentStatus.Assigned, DeliveryAssignmentStatus.PickedUp)]
    [InlineData(DeliveryAssignmentStatus.PickedUp, DeliveryAssignmentStatus.OutForDelivery)]
    [InlineData(DeliveryAssignmentStatus.OutForDelivery, DeliveryAssignmentStatus.Delivered)]
    public void EnsureValidTransition_AllowsSequentialSteps(DeliveryAssignmentStatus from, DeliveryAssignmentStatus to)
    {
        var exception = Record.Exception(() => _service.EnsureValidTransition(from, to));
        Assert.Null(exception);
    }

    [Theory]
    [InlineData(DeliveryAssignmentStatus.Assigned, DeliveryAssignmentStatus.OutForDelivery)]
    [InlineData(DeliveryAssignmentStatus.Assigned, DeliveryAssignmentStatus.Delivered)]
    [InlineData(DeliveryAssignmentStatus.PickedUp, DeliveryAssignmentStatus.Delivered)]
    [InlineData(DeliveryAssignmentStatus.Delivered, DeliveryAssignmentStatus.Assigned)]
    [InlineData(DeliveryAssignmentStatus.OutForDelivery, DeliveryAssignmentStatus.PickedUp)]
    public void EnsureValidTransition_RejectsSkippedOrBackwardSteps(DeliveryAssignmentStatus from, DeliveryAssignmentStatus to)
    {
        Assert.Throws<DomainValidationException>(() => _service.EnsureValidTransition(from, to));
    }

    [Fact]
    public void EnsureValidTransition_Delivered_IsTerminal()
    {
        Assert.Throws<DomainValidationException>(() => _service.EnsureValidTransition(DeliveryAssignmentStatus.Delivered, DeliveryAssignmentStatus.Delivered));
    }
}
