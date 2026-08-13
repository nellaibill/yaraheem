using Ecommerce.Modules.Orders.Application;
using Ecommerce.Modules.Orders.Domain;
using Ecommerce.Shared.Kernel.Exceptions;
using Xunit;

namespace Ecommerce.Tests;

public class OrderStatusTransitionServiceTests
{
    private readonly OrderStatusTransitionService _service = new();

    [Theory]
    [InlineData(OrderStatus.Pending, OrderStatus.Confirmed)]
    [InlineData(OrderStatus.Pending, OrderStatus.Cancelled)]
    [InlineData(OrderStatus.Confirmed, OrderStatus.Processing)]
    [InlineData(OrderStatus.Confirmed, OrderStatus.Cancelled)]
    [InlineData(OrderStatus.Processing, OrderStatus.Shipped)]
    [InlineData(OrderStatus.Processing, OrderStatus.Cancelled)]
    [InlineData(OrderStatus.Shipped, OrderStatus.Delivered)]
    public void EnsureValidTransition_AllowsDocumentedTransitions(OrderStatus from, OrderStatus to)
    {
        var exception = Record.Exception(() => _service.EnsureValidTransition(from, to));
        Assert.Null(exception);
    }

    [Theory]
    [InlineData(OrderStatus.Pending, OrderStatus.Shipped)]
    [InlineData(OrderStatus.Pending, OrderStatus.Delivered)]
    [InlineData(OrderStatus.Confirmed, OrderStatus.Shipped)]
    [InlineData(OrderStatus.Shipped, OrderStatus.Cancelled)]
    [InlineData(OrderStatus.Delivered, OrderStatus.Pending)]
    [InlineData(OrderStatus.Cancelled, OrderStatus.Pending)]
    [InlineData(OrderStatus.Delivered, OrderStatus.Confirmed)]
    public void EnsureValidTransition_RejectsSkippedOrBackwardTransitions(OrderStatus from, OrderStatus to)
    {
        Assert.Throws<DomainValidationException>(() => _service.EnsureValidTransition(from, to));
    }

    [Fact]
    public void EnsureValidTransition_TerminalStates_HaveNoOutboundTransitions()
    {
        Assert.Throws<DomainValidationException>(() => _service.EnsureValidTransition(OrderStatus.Delivered, OrderStatus.Delivered));
        Assert.Throws<DomainValidationException>(() => _service.EnsureValidTransition(OrderStatus.Cancelled, OrderStatus.Cancelled));
    }
}
