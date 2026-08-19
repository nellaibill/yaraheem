using Ecommerce.Modules.Settings.Contracts;

namespace Ecommerce.Modules.Settings.Application;

public interface IRestaurantSettingsService
{
    Task<RestaurantSettingsDto> GetAsync(CancellationToken cancellationToken);
    Task<RestaurantSettingsDto> UpdateAsync(UpdateRestaurantSettingsRequest request, Guid? updatedByUserId, string? updatedByEmail, CancellationToken cancellationToken);
}
