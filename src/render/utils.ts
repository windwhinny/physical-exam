import { bindActionCreators as bac, Dispatch} from 'redux';
// tslint:disable:no-any

export const bindActionCreators = <T>(actions: T, dispatch: Dispatch<any>): T => {
  return bac(actions as any, dispatch);
}

export function isTypeofComponent(child: React.ReactNode, Component: React.ReactType): boolean {
  if (!child) return false;
  if ((child as any).type === Component) {
    return true;
  }
  return false;
}
