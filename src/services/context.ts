import {verify} from "./jwt";
import {Session} from "../models/Session";
import {findOne} from "./typeorm";
import {pick} from "lodash";

export interface Context { }
export interface SessionContext {
  uuid: string;
  key: string;
  email: string;
  authenticated: boolean;
}

export interface AuthenticatedContext extends SessionContext {
  authenticated: true
}

export const isSessionContext = (obj:any): obj is SessionContext => {
  return !!obj.email && !!obj.uuid;
}

export const isAuthenticatedContext = (obj:any): obj is AuthenticatedContext => {
  return isSessionContext(obj) && obj['authenticated'] === true;
}

const context = async ({ req }): Promise<Context | SessionContext> => {
  const auth = req.headers.authorization || '';

  if(!!auth) {
    const jwt = await verify(auth);

    /**
     * Replace by memcache or other in-memory lookup
     */
    const session = await findOne(Session, {
      where: pick(jwt, 'uuid', 'key')
    });

    if(session) {
      return pick(session, 'uuid', 'key', 'email', 'authenticated');
    }
  }

  return { };
}

export default context;
