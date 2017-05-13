import {
  RecordService
} from '../../constants';
import registor from './registor';

const fn = registor('RecordService');
export default <
  T extends RecordService,
  K extends keyof RecordService
>(name: K): T[K] => {
  return fn(name);
};
