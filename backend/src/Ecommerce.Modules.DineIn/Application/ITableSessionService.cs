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
    Task<TableSessionDto> CloseSessionAsync(Guid sessionId, CloseTableSessionRequest request, CancellationToken cancellationToken);
    Task<TableSessionDto> CancelRoundAsync(Guid sessionId, Guid roundId, CancellationToken cancellationToken);
    Task<DineInRoundPrintDto> GetRoundForPrintAsync(Guid roundId, CancellationToken cancellationToken);
    Task<List<TableSessionDto>> GetSessionsForAdminAsync(CancellationToken cancellationToken);
}
