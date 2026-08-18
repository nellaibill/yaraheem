using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ecommerce.Database.Migrations.Migrations.DineIn
{
    /// <inheritdoc />
    public partial class AddDineInBillingBreakdown : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "service_charge_amount",
                schema: "dinein",
                table: "table_sessions",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "subtotal",
                schema: "dinein",
                table: "table_sessions",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "tax_amount",
                schema: "dinein",
                table: "table_sessions",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "service_charge_amount",
                schema: "dinein",
                table: "table_sessions");

            migrationBuilder.DropColumn(
                name: "subtotal",
                schema: "dinein",
                table: "table_sessions");

            migrationBuilder.DropColumn(
                name: "tax_amount",
                schema: "dinein",
                table: "table_sessions");
        }
    }
}
