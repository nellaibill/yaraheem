using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ecommerce.Database.Migrations.Migrations.Catalog
{
    /// <inheritdoc />
    public partial class AddProductPhase2Fields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_categories_parent_category_id",
                schema: "catalog",
                table: "categories");

            migrationBuilder.AddColumn<decimal>(
                name: "compare_price",
                schema: "catalog",
                table: "products",
                type: "numeric(12,2)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_featured",
                schema: "catalog",
                table: "products",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_published",
                schema: "catalog",
                table: "products",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "thumbnail_url",
                schema: "catalog",
                table: "products",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "display_order",
                schema: "catalog",
                table: "categories",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "ix_products_is_featured",
                schema: "catalog",
                table: "products",
                column: "is_featured");

            migrationBuilder.CreateIndex(
                name: "ix_products_is_published",
                schema: "catalog",
                table: "products",
                column: "is_published");

            migrationBuilder.CreateIndex(
                name: "ix_categories_parent_category_id_display_order",
                schema: "catalog",
                table: "categories",
                columns: new[] { "parent_category_id", "display_order" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_products_is_featured",
                schema: "catalog",
                table: "products");

            migrationBuilder.DropIndex(
                name: "ix_products_is_published",
                schema: "catalog",
                table: "products");

            migrationBuilder.DropIndex(
                name: "ix_categories_parent_category_id_display_order",
                schema: "catalog",
                table: "categories");

            migrationBuilder.DropColumn(
                name: "compare_price",
                schema: "catalog",
                table: "products");

            migrationBuilder.DropColumn(
                name: "is_featured",
                schema: "catalog",
                table: "products");

            migrationBuilder.DropColumn(
                name: "is_published",
                schema: "catalog",
                table: "products");

            migrationBuilder.DropColumn(
                name: "thumbnail_url",
                schema: "catalog",
                table: "products");

            migrationBuilder.DropColumn(
                name: "display_order",
                schema: "catalog",
                table: "categories");

            migrationBuilder.CreateIndex(
                name: "ix_categories_parent_category_id",
                schema: "catalog",
                table: "categories",
                column: "parent_category_id");
        }
    }
}
