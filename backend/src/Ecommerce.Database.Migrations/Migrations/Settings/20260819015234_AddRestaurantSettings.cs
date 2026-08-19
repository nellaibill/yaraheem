using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ecommerce.Database.Migrations.Migrations.Settings
{
    /// <inheritdoc />
    public partial class AddRestaurantSettings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "restaurant_settings",
                schema: "settings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    accepting_orders = table.Column<bool>(type: "boolean", nullable: false),
                    offers_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    todays_special_key = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    banner_enabled = table.Column<bool>(type: "boolean", nullable: false),
                    banner_title = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    banner_description = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    banner_code = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: true),
                    min_order_value = table.Column<decimal>(type: "numeric(10,2)", precision: 10, scale: 2, nullable: false),
                    delivery_radius_km = table.Column<decimal>(type: "numeric(6,2)", precision: 6, scale: 2, nullable: false),
                    open_time = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    close_time = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: false),
                    updated_by_user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    updated_by_email = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    is_deleted = table.Column<bool>(type: "boolean", nullable: false),
                    deleted_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_restaurant_settings", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "restaurant_settings",
                schema: "settings");
        }
    }
}
