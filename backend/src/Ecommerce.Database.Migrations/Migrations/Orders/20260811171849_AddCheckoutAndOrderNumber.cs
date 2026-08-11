using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ecommerce.Database.Migrations.Migrations.Orders
{
    /// <inheritdoc />
    public partial class AddCheckoutAndOrderNumber : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "phone",
                schema: "orders",
                table: "addresses");

            migrationBuilder.RenameColumn(
                name: "line2",
                schema: "orders",
                table: "addresses",
                newName: "address_line2");

            migrationBuilder.RenameColumn(
                name: "line1",
                schema: "orders",
                table: "addresses",
                newName: "address_line1");

            migrationBuilder.AddColumn<string>(
                name: "order_number",
                schema: "orders",
                table: "orders",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "phone_number",
                schema: "orders",
                table: "addresses",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "ix_orders_order_number",
                schema: "orders",
                table: "orders",
                column: "order_number",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_orders_order_number",
                schema: "orders",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "order_number",
                schema: "orders",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "phone_number",
                schema: "orders",
                table: "addresses");

            migrationBuilder.RenameColumn(
                name: "address_line2",
                schema: "orders",
                table: "addresses",
                newName: "line2");

            migrationBuilder.RenameColumn(
                name: "address_line1",
                schema: "orders",
                table: "addresses",
                newName: "line1");

            migrationBuilder.AddColumn<string>(
                name: "phone",
                schema: "orders",
                table: "addresses",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);
        }
    }
}
