import { createContactRepository } from "@/data/database";
import { createContactService } from "./contact-service";

export const contactService = createContactService(createContactRepository());

export { STAGES } from "./contact-service";
export type { Contact, Stage } from "./contact-service";
