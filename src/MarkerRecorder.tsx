import RNFetchBlob from 'rn-fetch-blob';

export class Marker {
  constructor(
    public name: string,
    public timestamp: number,
    public properties: {
      [name: string]: {value: any; type: string; displayName: string};
    },
  ) {}
}

export class MarkerBuilder {
  static buildShot(
    timestamp: number,
    angle: number,
    distance: number,
    overallQuality: number,
  ) {
    return new Marker('shot', timestamp, {
      angle: {value: angle, type: 'number', displayName: 'Deviation (°)'},
      distance: {value: distance, type: 'number', displayName: 'Distance (m)'},
      overallQuality: {
        value: overallQuality,
        type: 'star',
        displayName: 'Overall Quality (1-5)',
      },
    });
  }

  static buildGenericMarker(label: string, timestamp: number) {
    return new Marker(label, timestamp, {});
  }
}

export class MarkerRecorder {
  set folderPath(value: string) {
    this._folderPath = value;
  }
  private isFileCreated: boolean = false;
  private _folderPath: string;
  constructor(folderPath: string) {
    this._folderPath = folderPath;
  }

  async addMarker(marker: Marker) {
    let filePath = this._folderPath + '/marker.json';
    let currentData: {markers: Array<any>} = {markers: []};
    if (this.isFileCreated) {
      let markerString = await RNFetchBlob.fs.readFile(filePath, 'utf8');
      try {
        currentData = JSON.parse(markerString);
      } catch (error) {
        console.log('Error', '\n', markerString);
        throw error;
      }
    }
    currentData.markers.push(marker);
    await RNFetchBlob.fs.writeFile(
      filePath,
      JSON.stringify(currentData, undefined, '\t'),
      'utf8',
    );
    this.isFileCreated = true;
  }
}
