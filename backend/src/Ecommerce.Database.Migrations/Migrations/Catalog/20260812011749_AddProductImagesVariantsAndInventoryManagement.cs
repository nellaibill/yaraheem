using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ecommerce.Database.Migrations.Migrations.Catalog
{
    /// <inheritdoc />
    public partial class AddProductImagesVariantsAndInventoryManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_product_images_product_id",
                schema: "catalog",
                table: "product_images");

            migrationBuilder.DropColumn(
                name: "url",
                schema: "catalog",
                table: "product_images");

            migrationBuilder.RenameColumn(
                name: "sort_order",
                schema: "catalog",
                table: "product_images",
                newName: "display_order");

            migrationBuilder.AddColumn<string>(
                name: "color",
                schema: "catalog",
                table: "product_variants",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "price_override",
                schema: "catalog",
                table: "product_variants",
                type: "numeric(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "size",
                schema: "catalog",
                table: "product_variants",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "stock_quantity",
                schema: "catalog",
                table: "product_variants",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<string>(
                name: "alt_text",
                schema: "catalog",
                table: "product_images",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(300)",
                oldMaxLength: 300,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "image_url",
                schema: "catalog",
                table: "product_images",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "is_primary",
                schema: "catalog",
                table: "product_images",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "image_url",
                schema: "catalog",
                table: "categories",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_product_images_product_id_display_order",
                schema: "catalog",
                table: "product_images",
                columns: new[] { "product_id", "display_order" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_product_images_product_id_display_order",
                schema: "catalog",
                table: "product_images");

            migrationBuilder.DropColumn(
                name: "color",
                schema: "catalog",
                table: "product_variants");

            migrationBuilder.DropColumn(
                name: "price_override",
                schema: "catalog",
                table: "product_variants");

            migrationBuilder.DropColumn(
                name: "size",
                schema: "catalog",
                table: "product_variants");

            migrationBuilder.DropColumn(
                name: "stock_quantity",
                schema: "catalog",
                table: "product_variants");

            migrationBuilder.DropColumn(
                name: "image_url",
                schema: "catalog",
                table: "product_images");

            migrationBuilder.DropColumn(
                name: "is_primary",
                schema: "catalog",
                table: "product_images");

            migrationBuilder.DropColumn(
                name: "image_url",
                schema: "catalog",
                table: "categories");

            migrationBuilder.RenameColumn(
                name: "display_order",
                schema: "catalog",
                table: "product_images",
                newName: "sort_order");

            migrationBuilder.AlterColumn<string>(
                name: "alt_text",
                schema: "catalog",
                table: "product_images",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "url",
                schema: "catalog",
                table: "product_images",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "ix_product_images_product_id",
                schema: "catalog",
                table: "product_images",
                column: "product_id");
        }
    }
}
