import NeurosityAccount from '../src/NeurosityAccount';
import {Neurosity} from '../src/EEGHeadset/Neurosity';
import {readDir, stat, readFile, writeFile, unlink} from 'react-native-fs';
jest.setTimeout(60000);
jest.mock('react-native-fs', () => {
  return {
    mkdir: jest.fn(),
    moveFile: jest.fn(),
    copyFile: jest.fn(),
    pathForBundle: jest.fn(),
    pathForGroup: jest.fn(),
    getFSInfo: jest.fn(),
    getAllExternalFilesDirs: jest.fn(),
    unlink: jest.fn(),
    exists: jest.fn(),
    stopDownload: jest.fn(),
    resumeDownload: jest.fn(),
    isResumable: jest.fn(),
    stopUpload: jest.fn(),
    completeHandlerIOS: jest.fn(),
    readDir: jest.fn(),
    readDirAssets: jest.fn(),
    existsAssets: jest.fn(),
    readdir: jest.fn(),
    setReadable: jest.fn(),
    stat: jest.fn(),
    readFile: jest.fn(),
    read: jest.fn(),
    readFileAssets: jest.fn(),
    hash: jest.fn(),
    copyFileAssets: jest.fn(),
    copyFileAssetsIOS: jest.fn(),
    copyAssetsVideoIOS: jest.fn(),
    writeFile: jest.fn(),
    appendFile: jest.fn(),
    write: jest.fn(),
    downloadFile: jest.fn(),
    uploadFiles: jest.fn(),
    touch: jest.fn(),
    MainBundlePath: jest.fn(),
    CachesDirectoryPath: jest.fn(),
    DocumentDirectoryPath: '',
    ExternalDirectoryPath: jest.fn(),
    ExternalStorageDirectoryPath: jest.fn(),
    TemporaryDirectoryPath: jest.fn(),
    LibraryDirectoryPath: jest.fn(),
    PicturesDirectoryPath: jest.fn(),
  };
});
jest.mock('../src/EEGHeadset/Neurosity');
const loginMock = jest
  .spyOn(Neurosity.prototype, 'login')
  .mockImplementation(async () => {
    return new Promise((resolve) => {
      resolve();
    });
  });

const logoutMock = jest
  .spyOn(Neurosity.prototype, 'logout')
  .mockImplementation(() => {
    return new Promise(resolve => {
      resolve();
    });
  });

beforeEach(() => {
  jest.mocked(readDir).mockClear();
  jest.mocked(stat).mockClear();
  jest.mocked(readFile).mockClear();
  jest.mocked(writeFile).mockClear();
  loginMock.mockClear();
  logoutMock.mockClear();
});

test('create neurosity account with no file', async () => {
  jest.mocked(readDir).mockImplementation(path => {
    console.log('Read dir mock');
    return new Promise(resolve => {
      resolve([]);
    });
  });
  let account = new NeurosityAccount(new Neurosity());
  await account.loadUser();
  expect(loginMock).toHaveBeenCalledTimes(0);
  expect(readDir).toHaveBeenCalled();
  expect(account.loggedIn).toBe(false);
});

test('create neurosity account with a file', async () => {
  jest.mocked(readDir).mockImplementation(path => {
    return new Promise(resolve => {
      resolve([
        {
          ctime: undefined,
          mtime: undefined,
          size: 1000,
          isFile: () => {
            return true;
          },
          isDirectory: () => {
            return false;
          },
          path: '',
          name: 'neurosity.json',
        },
      ]);
    });
  });
  jest.mocked(stat).mockImplementation(path => {
    return new Promise(resolve => {
      resolve({
        ctime: 1,
        mtime: 1,
        size: 1000,
        mode: 1,
        originalFilepath: '',
        isFile: () => {
          return true;
        },
        isDirectory: () => {
          return false;
        },
        path: '',
        name: 'neurosity.json',
      });
    });
  });
  jest.mocked(readFile).mockImplementation((path, encodingOrOptions) => {
    return new Promise(resolve => {
      resolve(
        JSON.stringify({
          username: '',
          password: '',
        }),
      );
    });
  });
  let account = new NeurosityAccount(new Neurosity());
  await account.loadUser();
  expect(readDir).toHaveBeenCalled();
  expect(readFile).toHaveBeenCalled();
  expect(loginMock).toHaveBeenCalledTimes(1);
  expect(account.loggedIn).toBe(true);
});

test('connect to neurosity', async () => {
  let account = new NeurosityAccount(new Neurosity());
  await account.connect('username', 'password');
  expect(loginMock).toHaveBeenCalledTimes(1);
  expect(account.loggedIn).toBe(true);
  expect(writeFile).toHaveBeenCalled();
});

test('connect to neurosity with wrong password', async () => {
  loginMock.mockImplementation(() => {
    throw new Error('Wrong credentials');
  });
  let account = new NeurosityAccount(new Neurosity());
  await expect(account.connect('username', 'password')).rejects.toThrow(Error);
  expect(loginMock).toHaveBeenCalledTimes(1);
  expect(account.loggedIn).toBe(false);
  expect(writeFile).toHaveBeenCalledTimes(0);
});

test('disconnect from  neurosity', async () => {
  let account = new NeurosityAccount(new Neurosity());
  //await account.connect('username', 'password');
  await account.logout();
  expect(logoutMock).toHaveBeenCalledTimes(1);
  expect(account.loggedIn).toBe(false);
  expect(unlink).toHaveBeenCalled();
});
