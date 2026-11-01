import Enophic from "@enophic-ai/sdk";

/**
 * The shared pieces of the server side: one SDK client (auth comes from
 * ENOPHIC_API_KEY or the credentials `eno auth login` saves) and the
 * httpOnly cookie that is this app's entire notion of identity. Every API
 * call lives in the route that triggers it. There is no service layer.
 */
export const client = new Enophic();

export const SESSION_COOKIE = "roadtrip_planner_session_id";
