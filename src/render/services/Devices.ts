import {
  DeviceManagerService,
} from '../../constants';
import registor from './registor';

const fn = registor('DeviceManager');
export default <
  T extends DeviceManagerService,
  K extends keyof DeviceManagerService
>(name: K): T[K] => {
  return fn(name);
};
