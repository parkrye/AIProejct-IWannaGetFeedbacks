export {
  registerPersonaCategory,
  getPersonaById,
  getAllPersonas,
  getPersonasByIds,
  getAllCategories,
  addPersona,
  updatePersona,
  removePersona,
  clearRegistry,
} from "./personaRegistry.ts";
export { loadPersonasFromDirectory } from "./loadPersonas.ts";
export { savePersonasToDirectory } from "./savePersonas.ts";
export { matchPersonasByContent } from "./matchPersonas.ts";
export type { Persona, PersonaCategory, PersonaTraits } from "./types.ts";
