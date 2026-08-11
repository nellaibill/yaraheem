using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ecommerce.Database.Migrations.Migrations.Orders
{
    /// <inheritdoc />
    public partial class AddPaymentsAndOrderTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "note",
                schema: "orders",
                table: "order_status_history");

            migrationBuilder.RenameColumn(
                name: "status",
                schema: "orders",
                table: "order_status_history",
                newName: "new_status");

            migrationBuilder.AddColumn<Guid>(
                name: "changed_by_user_id",
                schema: "orders",
                table: "order_status_history",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "notes",
                schema: "orders",
                table: "order_status_history",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "previous_status",
                schema: "orders",
                table: "order_status_history",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "changed_by_user_id",
                schema: "orders",
                table: "order_status_history");

            migrationBuilder.DropColumn(
                name: "notes",
                schema: "orders",
                table: "order_status_history");

            migrationBuilder.DropColumn(
                name: "previous_status",
                schema: "orders",
                table: "order_status_history");

            migrationBuilder.RenameColumn(
                name: "new_status",
                schema: "orders",
                table: "order_status_history",
                newName: "status");

            migrationBuilder.AddColumn<string>(
                name: "note",
                schema: "orders",
                table: "order_status_history",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }
    }
}
