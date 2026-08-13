using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ecommerce.Database.Migrations.Migrations.Orders
{
    /// <inheritdoc />
    public partial class AddDeliveryFeeAccounting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "delivery_fee",
                schema: "orders",
                table: "orders",
                type: "numeric(12,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "discount_amount",
                schema: "orders",
                table: "orders",
                type: "numeric(12,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "idempotency_key",
                schema: "orders",
                table: "orders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_orders_idempotency_key",
                schema: "orders",
                table: "orders",
                column: "idempotency_key",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_orders_idempotency_key",
                schema: "orders",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "delivery_fee",
                schema: "orders",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "discount_amount",
                schema: "orders",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "idempotency_key",
                schema: "orders",
                table: "orders");
        }
    }
}
