function SpriteSheet(size, tileSize, data, types) {
    this.size = size;
    this.data = data;
    this.types = types;
    this.tileWidth = 1 << tileSize;

    var tileWidth = this.tileWidth;
    var sheetWidth = 1 << size;

    this.put = function(ctx, x, y, n) {
        ctx.drawImage(data,
                      (n % sheetWidth) * tileWidth,
                      (n >> size) * tileWidth,
                      tileWidth, tileWidth,
                      x, y,
                      tileWidth, tileWidth);
    };
}