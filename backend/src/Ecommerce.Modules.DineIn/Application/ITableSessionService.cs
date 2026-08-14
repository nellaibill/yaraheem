using Ecommerce.Modules.DineIn.Contracts;

namespace Ecommerce.Modules.DineIn.Application;

public interface ITableSessionService
{
    Task<List<DiningTableDto>> GetTablesAsync(CancellationToken cancellationToken);
    Task<DiningTableDto> CreateTableAsync(CreateDiningTableRequest request, CancellationToken cancellationToken);
    Task<DiningTableDto> UpdateTableAsync(Guid tableId, UpdateDiningTableRequest request, CancellationToken cancellationToken);
    Task<DiningTableDto> MarkTableCleanedAsync(Guid tableId, CancellationToken cancellationToken);

    Task<TableSessionDto> OpenSessionAsync(Guid tableId, Guid waiterUserId, OpenTableSessionRequest request, CancellationToken cancellationToken);
    Task<TableSessionDto> GetSessionAsync(Guid sessionId, CancellationToken cancellationToken);
    Task<TableSessionDto> FireRoundAsync(Guid sessionId, FireRoundRequest request, CancellationToken cancellationToken);
    Task<TableSessionDto> RequestBillAsync(Guid sessionId, CancellationToken cancellationToken);
    Task<TableSessionDto> CloseSessionAsync(Guid sessionId, CancellationToken cancellationToken);
    Task<TableSessionDto> CancelRoundAsync(Guid sessionId, Guid roundId, CancellationToken cancellationToken);

    Task<DineInPaymentDto> RecordPaymentAsync(Guid sessionId, string label, decimal amount, string method, string? razorpayOrderId, CancellationToken cancellationToken);
    Task<TableSessionDto> MarkPaymentPaidAsync(Guid sessionId, Guid paymentId, string? razorpayPaymentId, CancellationToken cancellationToken);
    Task<DineInRoundPrintDto> GetRoundForPrintAsync(Guid roundId, CancellationToken cancellationToken);
    Task<List<TableSessionDto>> GetSessionsForAdminAsync(CancellationToken cancellationToken);

    Task<List<KitchenRoundDto>> GetKitchenQueueAsync(CancellationToken cancellationToken);
    Task<KitchenRoundDto> AdvanceRoundStatusAsync(Guid roundId, CancellationToken cancellationToken);
}
