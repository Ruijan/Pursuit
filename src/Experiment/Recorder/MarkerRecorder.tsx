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
  private saving: boolean = false;
  private markerQueue: Array<Marker> = [];
  private interval: any = 0;
  constructor(folderPath: string) {
    this._folderPath = folderPath;
    this.interval = setInterval(() => this.saveMarkers(), 5000);
  }

  addMarker(marker: Marker) {
    this.markerQueue.push(marker);
  }

  async saveMarkers() {
    if (this.saving || this.markerQueue.length === 0) {
      return;
    }
    this.saving = true;
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
    currentData.markers = currentData.markers.concat(this.markerQueue);
    await RNFetchBlob.fs.writeFile(
      filePath,
      JSON.stringify(currentData, undefined, '\t'),
      'utf8',
    );
    this.markerQueue = [];
    this.isFileCreated = true;
    this.saving = false;
  }

  stopSavingMarker() {
    clearInterval(this.interval);
  }
}
