# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Kopiowanie plików projektu i przywracanie zależności
COPY *.csproj ./
RUN dotnet restore

# Kopiowanie reszty plików i budowanie
COPY . ./
RUN dotnet publish -c Release -o out

# Stage 2: Run
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/out .

# Ekspozycja portu dla API i metryk /metrics
EXPOSE 8080
ENTRYPOINT ["dotnet", "ModerationSystem.Api.dll"]
