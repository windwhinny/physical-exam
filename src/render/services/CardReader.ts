import {
  CardReaderService
} from '../../constants';
import registor from './registor';

const fn = registor('CardReaderService');
export default <
  T extends CardReaderService,
  K extends keyof CardReaderService
>(name: K): T[K] => {
  return fn(name);
};
