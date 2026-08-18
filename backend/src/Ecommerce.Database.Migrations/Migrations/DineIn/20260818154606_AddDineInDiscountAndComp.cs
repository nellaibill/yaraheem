using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ecommerce.Database.Migrations.Migrations.DineIn
{
    /// <inheritdoc />
    public partial class AddDineInDiscountAndComp : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "discount_amount",
                schema: "dinein",
                table: "table_sessions",
                type: "numeric(10,2)",
                precision: 10,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "discount_reason",
                schema: "dinein",
                table: "table_sessions",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "comp_reason",
                schema: "dinein",
                table: "dine_in_round_items",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_comped",
                schema: "dinein",
                table: "dine_in_round_items",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "discount_amount",
                schema: "dinein",
                table: "table_sessions");

            migrationBuilder.DropColumn(
                name: "discount_reason",
                schema: "dinein",
                table: "table_sessions");

            migrationBuilder.DropColumn(
                name: "comp_reason",
                schema: "dinein",
                table: "dine_in_round_items");

            migrationBuilder.DropColumn(
                name: "is_comped",
                schema: "dinein",
                table: "dine_in_round_items");
        }
    }
}
