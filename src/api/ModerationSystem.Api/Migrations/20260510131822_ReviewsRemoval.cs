using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ModerationSystem.Api.Migrations
{
    /// <inheritdoc />
    public partial class ReviewsRemoval : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Reviews");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CognitoUserId = table.Column<string>(type: "text", nullable: false),
                    PostId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DeletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    ReviewType = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UserCognitoUserId = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reviews_Posts_PostId",
                        column: x => x.PostId,
                        principalTable: "Posts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reviews_Users_CognitoUserId",
                        column: x => x.CognitoUserId,
                        principalTable: "Users",
                        principalColumn: "CognitoUserId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reviews_Users_UserCognitoUserId",
                        column: x => x.UserCognitoUserId,
                        principalTable: "Users",
                        principalColumn: "CognitoUserId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_CognitoUserId",
                table: "Reviews",
                column: "CognitoUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_PostId",
                table: "Reviews",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_UserCognitoUserId",
                table: "Reviews",
                column: "UserCognitoUserId");
        }
    }
}
