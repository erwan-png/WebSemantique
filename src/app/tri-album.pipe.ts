import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'triAlbum',
  pure: false
})
export class TriAlbumPipe implements PipeTransform {

  transform(albums: any[]): any[] {
    const albumsTries = albums.sort((albumA: any, albumB: any) => {
      if ((albumA.releaseDate as Date) < (albumB.releaseDate as Date))
        return 1;
      if ((albumA.releaseDate as Date) > (albumB.releaseDate as Date))
        return -1;
      return 0;
    });
    return albumsTries;
  }

}
