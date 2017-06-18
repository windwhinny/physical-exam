import {
  BluetoothService,
} from '../../constants';
import registor from './registor';

const fn = registor('BluetoothService');
export default <
  T extends BluetoothService,
  K extends keyof BluetoothService
>(name: K): T[K] => {
  return fn(name);
};
