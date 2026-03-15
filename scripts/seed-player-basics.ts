/**
 * Script pour mettre à jour les caractéristiques basiques des joueurs
 * à partir des données exportées.
 *
 * Usage: npx tsx scripts/seed-player-basics.ts
 */

import "dotenv/config"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// ── Mapping position française → code ──
const POSITION_NAME_TO_CODE: Record<string, string> = {
  "Gardien de but": "GK",
  "Gardien": "GK",
  "Défenseur central": "DC",
  "Arrière gauche": "DG",
  "Arrière droit": "DD",
  "Libéro": "LIB",
  "Milieu défensif central": "MDC",
  "Milieu défensif": "MDF",
  "Milieu central": "MC",
  "Milieu offensif central": "MOC",
  "Milieu offensif": "MOC",
  "Milieu relayeur": "MR",
  "Milieu gauche": "MG",
  "Milieu droit": "MD",
  "Ailier gauche": "AG",
  "Ailier droit": "AD",
  "Attaquant": "ATT",
  "Avant-centre / Buteur": "BU",
  "Avant-centre": "BU",
  "Second attaquant": "SS",
  "Attaquant de pointe": "AP",
}

// ── Mapping pied fort ──
const FOOT_MAP: Record<string, string> = {
  "Droit": "RIGHT",
  "Gauche": "LEFT",
  "Ambidextre": "BOTH",
}

// ── Parsers ──
function parseHeight(raw: string): number | null {
  if (!raw) return null
  // Format "1m82" → 182
  const match = raw.match(/(\d+)\s*m\s*(\d+)/)
  if (match) {
    return parseInt(match[1]) * 100 + parseInt(match[2])
  }
  // Format "182" ou "182 cm"
  const cmMatch = raw.match(/(\d+)/)
  if (cmMatch) {
    const val = parseInt(cmMatch[1])
    return val > 100 ? val : val * 100 // si < 100, c'est probablement en mètres entiers
  }
  return null
}

function parseWeight(raw: string): number | null {
  if (!raw) return null
  const match = raw.match(/(\d+)/)
  return match ? parseInt(match[1]) : null
}

function mapPosition(raw: string): string | null {
  if (!raw || raw === "(deleted option)") return null
  return POSITION_NAME_TO_CODE[raw] || null
}

function mapFoot(raw: string): string | null {
  if (!raw) return null
  return FOOT_MAP[raw] || null
}

// ── Données ──
const playerData = [
  {"Pied fort":"Droit","Poids":"130 kg","Poste ref":"Défenseur central","Poste secondaire":"Arrière droit","Poste ultérieur":"Milieu défensif","taille":"1m82","user":"getbu.kevin@gmail.com"},
  {"Pied fort":"Droit","Poids":"75 kg","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"1m70","user":"sydneydefer@hotmail.fr"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"pierre.lhotellier051186@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"clem.hayere@hotmail.fr"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"clem.hayere+test@hotmail.fr"},
  {"Pied fort":"Droit","Poids":"85 kg","Poste ref":"Défenseur central","Poste secondaire":"","Poste ultérieur":"Milieu défensif","taille":"1m88","user":"djibrilthialawdiop4@gmail.com"},
  {"Pied fort":"Droit","Poids":"74 kg","Poste ref":"Défenseur central","Poste secondaire":"","Poste ultérieur":"","taille":"1m83","user":"moussaddaqsalah@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"zaki.noubir@gmail.com"},
  {"Pied fort":"Droit","Poids":"68 kg","Poste ref":"Milieu défensif","Poste secondaire":"(deleted option)","Poste ultérieur":"Milieu offensif","taille":"1m81","user":"ametbabou00@gmail.com"},
  {"Pied fort":"Gauche","Poids":"71 kg","Poste ref":"Arrière gauche","Poste secondaire":"Ailier gauche","Poste ultérieur":"","taille":"1m84","user":"souleymanebasse10@icloud.com"},
  {"Pied fort":"Droit","Poids":"75 kg","Poste ref":"Défenseur central","Poste secondaire":"Arrière droit","Poste ultérieur":"","taille":"1m80","user":"anseani@hotmail.fr"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"chorta@fcfleury91.fr"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"x.collin@hotmail.com"},
  {"Pied fort":"Droit","Poids":"80 kg","Poste ref":"Défenseur central","Poste secondaire":"Milieu défensif","Poste ultérieur":"Arrière droit","taille":"1m87","user":"iapb5@icloud.com"},
  {"Pied fort":"Droit","Poids":"82 kg","Poste ref":"Attaquant","Poste secondaire":"Ailier droit","Poste ultérieur":"Ailier gauche","taille":"1m87","user":"raphael.gerbeaud@icloud.com"},
  {"Pied fort":"Droit","Poids":"55 kg","Poste ref":"Milieu central","Poste secondaire":"Milieu offensif","Poste ultérieur":"Ailier gauche","taille":"1m69","user":"castantmarius@gmail.com"},
  {"Pied fort":"Droit","Poids":"83 kg","Poste ref":"Gardien de but","Poste secondaire":"Gardien de but","Poste ultérieur":"","taille":"1m94","user":"enzo.tostivint@icloid.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"lebertpierrick@gmail.com"},
  {"Pied fort":"Gauche","Poids":"78 kg","Poste ref":"Arrière gauche","Poste secondaire":"Arrière droit","Poste ultérieur":"Défenseur central","taille":"1m80","user":"thibaultbouedec.pro@gmail.com"},
  {"Pied fort":"Gauche","Poids":"79 kg","Poste ref":"Défenseur central","Poste secondaire":"Milieu défensif","Poste ultérieur":"Arrière gauche","taille":"1m88","user":"chocoibra2019@icloud.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"tarennesrecrutement@gmail.com"},
  {"Pied fort":"Gauche","Poids":"75 kg","Poste ref":"Arrière gauche","Poste secondaire":"Défenseur central","Poste ultérieur":"Milieu offensif","taille":"1m70","user":"midu15@iclou.com"},
  {"Pied fort":"Droit","Poids":"77 kg","Poste ref":"Milieu défensif","Poste secondaire":"Milieu central","Poste ultérieur":"Milieu offensif","taille":"1m84","user":"faizyassin04@gmail.com"},
  {"Pied fort":"Droit","Poids":"84 kg","Poste ref":"Défenseur central","Poste secondaire":"Arrière droit","Poste ultérieur":"","taille":"1m86","user":"bricenegouai.bn@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"maxencederrien6@gmail.com"},
  {"Pied fort":"Droit","Poids":"73 kg","Poste ref":"Attaquant","Poste secondaire":"","Poste ultérieur":"","taille":"1m81","user":"alexisebrard64@gmail.com"},
  {"Pied fort":"Gauche","Poids":"75 kg","Poste ref":"Milieu central","Poste secondaire":"Défenseur central","Poste ultérieur":"Milieu offensif","taille":"1m83","user":"nathan.epaillard@gmail.com"},
  {"Pied fort":"Droit","Poids":"68 kg","Poste ref":"Défenseur central","Poste secondaire":"","Poste ultérieur":"","taille":"1m70","user":"popineau.jordan@gmail.com"},
  {"Pied fort":"Droit","Poids":"77 kg","Poste ref":"Défenseur central","Poste secondaire":"Milieu central","Poste ultérieur":"Arrière droit","taille":"1m82","user":"bachngom1@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"aniss.el@hotmail.fr"},
  {"Pied fort":"Droit","Poids":"75 kg","Poste ref":"Milieu central","Poste secondaire":"Défenseur central","Poste ultérieur":"Arrière droit","taille":"1m80","user":"haris40@icloud.com"},
  {"Pied fort":"Droit","Poids":"79 kg","Poste ref":"Attaquant","Poste secondaire":"Ailier droit","Poste ultérieur":"Milieu offensif","taille":"1m81","user":"deckymcmanus24@hotmail.com"},
  {"Pied fort":"Droit","Poids":"73 kg","Poste ref":"Milieu offensif","Poste secondaire":"Attaquant","Poste ultérieur":"(deleted option)","taille":"1m79","user":"antomazure63@gmail.com"},
  {"Pied fort":"Droit","Poids":"82 kg","Poste ref":"Milieu central","Poste secondaire":"Ailier droit","Poste ultérieur":"(deleted option)","taille":"1m85","user":"vyvy1997@icloud.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"baptiste_drouet@hotmail.fr"},
  {"Pied fort":"Droit","Poids":"69 kg","Poste ref":"Arrière droit","Poste secondaire":"Arrière gauche","Poste ultérieur":"Défenseur central","taille":"1m78","user":"thomasnathansb29@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"nicopinard@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"hrvoje.jozak@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"yvonpouliquen@orange.fr"},
  {"Pied fort":"Droit","Poids":"73 kg","Poste ref":"Milieu central","Poste secondaire":"Milieu défensif","Poste ultérieur":"","taille":"1m80","user":"pierre.magnon.12@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"jacques@thefamilygroup.be"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"drew@excelsiorpro.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"chicoben13@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"andy.rmsc@gmail.com"},
  {"Pied fort":"Gauche","Poids":"68 kg","Poste ref":"Arrière gauche","Poste secondaire":"Arrière droit","Poste ultérieur":"","taille":"1m74","user":"koly95210@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"christopherglombard.fcba@gmail.com"},
  {"Pied fort":"Droit","Poids":"86 kg","Poste ref":"Ailier droit","Poste secondaire":"Attaquant","Poste ultérieur":"","taille":"1m92","user":"rambaud.thib@gmail.com"},
  {"Pied fort":"Droit","Poids":"65 kg","Poste ref":"Milieu central","Poste secondaire":"","Poste ultérieur":"","taille":"1m77","user":"lucasfranco16110@gmail.com"},
  {"Pied fort":"Gauche","Poids":"79 kg","Poste ref":"Gardien de but","Poste secondaire":"Gardien de but","Poste ultérieur":"","taille":"1m84","user":"lamonge.anthony@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"antoinebadeau@gmail.com"},
  {"Pied fort":"Gauche","Poids":"82 kg","Poste ref":"Défenseur central","Poste secondaire":"Arrière gauche","Poste ultérieur":"","taille":"1m90","user":"sandro.t34110@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"recrutementcdf@fclorient.bzh"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"baptistemontabrun@outlook.fr"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"fathy01120@live.fr"},
  {"Pied fort":"Droit","Poids":"74 kg","Poste ref":"Ailier droit","Poste secondaire":"(deleted option)","Poste ultérieur":"Ailier gauche","taille":"1m87","user":"victor.fablet@hotmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"dislairetheo@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"ghemidy@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"fab.tempesta@gmail.com"},
  {"Pied fort":"Droit","Poids":"70 kg","Poste ref":"Milieu offensif","Poste secondaire":"Milieu central","Poste ultérieur":"Milieu défensif","taille":"1m78","user":"samueloynr@yahoo.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"noguesdelorsg@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"thomas_andre@hotmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"slylubino@gmail.com"},
  {"Pied fort":"Gauche","Poids":"75 kg","Poste ref":"Milieu central","Poste secondaire":"Ailier droit","Poste ultérieur":"(deleted option)","taille":"1m86","user":"ahmedmlayeh7@gmail.com"},
  {"Pied fort":"","Poids":"70 kg","Poste ref":"Milieu défensif","Poste secondaire":"Arrière droit","Poste ultérieur":"Défenseur central","taille":"1m81","user":"gwenmalonga76@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"jerome.fouble@usbco.com"},
  {"Pied fort":"Ambidextre","Poids":"78 kg","Poste ref":"Attaquant","Poste secondaire":"Milieu offensif","Poste ultérieur":"","taille":"1m90","user":"raphaelniculescu10@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"lykos.consulting.world@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"mamourdiop2406@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"sajeth29@gmail.com"},
  {"Pied fort":"Gauche","Poids":"75 kg","Poste ref":"(deleted option)","Poste secondaire":"","Poste ultérieur":"","taille":"1m88","user":"lucas_morhan@hotmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"ydiheloi@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"jeremymarec@gmail.com"},
  {"Pied fort":"Ambidextre","Poids":"70 kg","Poste ref":"Ailier gauche","Poste secondaire":"Arrière gauche","Poste ultérieur":"Arrière droit","taille":"1m72","user":"naelalex506@gmail.com"},
  {"Pied fort":"Gauche","Poids":"78 kg","Poste ref":"Ailier droit","Poste secondaire":"Milieu offensif","Poste ultérieur":"Ailier gauche","taille":"1m82","user":"nukurialicia261@gmail.com"},
  {"Pied fort":"Droit","Poids":"62 kg","Poste ref":"Milieu offensif","Poste secondaire":"","Poste ultérieur":"Milieu central","taille":"1m70","user":"bayeniassmedinaa@gmail.com"},
  {"Pied fort":"Droit","Poids":"80 kg","Poste ref":"Gardien de but","Poste secondaire":"Gardien de but","Poste ultérieur":"","taille":"1m84","user":"roman.daloz@gmail.com"},
  {"Pied fort":"Droit","Poids":"73 kg","Poste ref":"Milieu défensif","Poste secondaire":"Milieu offensif","Poste ultérieur":"Arrière gauche","taille":"1m78","user":"elhadjidaourniang0@gmail.com"},
  {"Pied fort":"Droit","Poids":"78 kg","Poste ref":"Défenseur central","Poste secondaire":"Milieu défensif","Poste ultérieur":"Arrière droit","taille":"1m83","user":"zakariasoumah1@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"pierrenicouleaud@hotmail.fr"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"yassineymar7@gmail.com"},
  {"Pied fort":"Droit","Poids":"68 kg","Poste ref":"Arrière droit","Poste secondaire":"Arrière gauche","Poste ultérieur":"Milieu offensif","taille":"1m72","user":"detoyahiri@gmail.com"},
  {"Pied fort":"Droit","Poids":"80 kg","Poste ref":"Milieu défensif","Poste secondaire":"Défenseur central","Poste ultérieur":"Arrière droit","taille":"1m88","user":"mamadou.souare56@icloud.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"yassine.harb@gmail.com"},
  {"Pied fort":"Droit","Poids":"86 kg","Poste ref":"Gardien de but","Poste secondaire":"Gardien de but","Poste ultérieur":"","taille":"1m94","user":"enzo.tostivint@icloud.com"},
  {"Pied fort":"Droit","Poids":"68 kg","Poste ref":"Arrière droit","Poste secondaire":"Ailier gauche","Poste ultérieur":"(deleted option)","taille":"1m77","user":"zaidyazid06@gmail.com"},
  {"Pied fort":"Gauche","Poids":"69 kg","Poste ref":"(deleted option)","Poste secondaire":"Milieu défensif","Poste ultérieur":"","taille":"1m77","user":"amoinrose225@gmail.com"},
  {"Pied fort":"Ambidextre","Poids":"51 kg","Poste ref":"Milieu central","Poste secondaire":"Milieu offensif","Poste ultérieur":"Ailier gauche","taille":"1m53","user":"israeldayamba253@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"kgpipaa07@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"victorlobry@live.com"},
  {"Pied fort":"Droit","Poids":"80 kg","Poste ref":"Milieu offensif","Poste secondaire":"Milieu central","Poste ultérieur":"","taille":"1m81","user":"clem.hayere@hotmail.fr"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"tperchaud@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"andrea.gambetta@yahoo.com"},
  {"Pied fort":"Droit","Poids":"76 kg","Poste ref":"Gardien de but","Poste secondaire":"","Poste ultérieur":"","taille":"1m83","user":"andrea.gambetta@yahoo.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"o.miannay@outlook.fr"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"vincentguiard76@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"marlon.jondott@gmail.com"},
  {"Pied fort":"Droit","Poids":"67 kg","Poste ref":"Milieu défensif","Poste secondaire":"Milieu central","Poste ultérieur":"Arrière droit","taille":"1m70","user":"marlon.jondott@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"antoinebadeau+1@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"pierrenicouleaud@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"jbaptiste.jp@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"kyllianstill@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"bissoumabassagnon@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"genidepardieu6@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"leandrehoupier@icloud.com"},
  {"Pied fort":"Droit","Poids":"67 kg","Poste ref":"Attaquant","Poste secondaire":"Ailier gauche","Poste ultérieur":"Milieu offensif","taille":"1m85","user":"genidepardieu6@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"kouakoubihawauh@gmail.com"},
  {"Pied fort":"Droit","Poids":"70 kg","Poste ref":"Ailier gauche","Poste secondaire":"Ailier droit","Poste ultérieur":"Attaquant","taille":"1m75","user":"kouakoubihawauh@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"devson2007@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"ntedikamikeman@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"mwentzinger@wmsports-conseils.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"darius.marshall7@yahoo.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"guirassy.mohamed.pro@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"marcelkantour@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"ouattaradylan2@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"simozaali9@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"abdouldiallo280@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"nazirbusinessservices@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"ralayavao@gmail.com"},
  {"Pied fort":"Droit","Poids":"71 kg","Poste ref":"Milieu défensif","Poste secondaire":"","Poste ultérieur":"","taille":"1m80","user":"kgpipaa07@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"rahimdebbah30@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"ines.gcha@outlook.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"lyesboumertit@gmail.com"},
  {"Pied fort":"Ambidextre","Poids":"75 kg","Poste ref":"Milieu offensif","Poste secondaire":"Ailier gauche","Poste ultérieur":"Milieu central","taille":"1m87","user":"lyesboumertit@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"linden89@hotmail.fr"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"kameron.loungoualapro@gmail.com"},
  {"Pied fort":"Droit","Poids":"65 kg","Poste ref":"Défenseur central","Poste secondaire":"Défenseur central","Poste ultérieur":"Arrière droit","taille":"1m84","user":"kameron.loungoualapro@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"florianjacques90@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"amsellemdan85@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"jusicagent@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"amirmekni90@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"clem.hayere+club@hotmail.fr"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"kaisraki@yahoo.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"nomena.thamon@outlook.fr"},
  {"Pied fort":"Droit","Poids":"75 kg","Poste ref":"Milieu défensif","Poste secondaire":"Défenseur central","Poste ultérieur":"Milieu central","taille":"1m90","user":"nomena.thamon@outlook.fr"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"saadzinaoui12@gmail.com"},
  {"Pied fort":"Droit","Poids":"84 kg","Poste ref":"Milieu offensif","Poste secondaire":"Ailier gauche","Poste ultérieur":"Attaquant","taille":"1m90","user":"saadzinaoui12@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"urievalan@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"mouhandongo2007@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"www.saliou628diallo@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"cheikhatabba94@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"isaac.camara2007@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"stephendiabira7@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"fodemomobangoura0@gmail.com"},
  {"Pied fort":"Droit","Poids":"50 kg","Poste ref":"Ailier gauche","Poste secondaire":"Ailier gauche","Poste ultérieur":"Attaquant","taille":"1m80","user":"fodemomobangoura0@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"sim.lebras@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"djebiarsene83@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"princebamanissa@gmail.com"},
  {"Pied fort":"Ambidextre","Poids":"53 kg","Poste ref":"Arrière gauche","Poste secondaire":"Ailier droit","Poste ultérieur":"Attaquant","taille":"1m70","user":"princebamanissa@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"jean2005albert@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"goalvia.agency@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"engerlamaria@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"j.mayingi@hotmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"metzo2007balde@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"tom.dilorenzocreps99@gmail.com"},
  {"Pied fort":"","Poids":"","Poste ref":"","Poste secondaire":"","Poste ultérieur":"","taille":"","user":"timitesekoumayer@gmail.com"},
  {"Pied fort":"Droit","Poids":"70 kg","Poste ref":"Milieu central","Poste secondaire":"Milieu offensif","Poste ultérieur":"","taille":"1m82","user":"timitesekoumayer@gmail.com"},
]

async function main() {
  console.log("🏟️  Début de la mise à jour des profils joueurs...\n")

  let updated = 0
  let skippedNoUser = 0
  let skippedNoData = 0
  let skippedNotFound = 0
  let skippedNoProfile = 0
  let errors = 0

  // Dédupliquer : pour les emails en double, garder l'entrée avec le plus de données
  const byEmail = new Map<string, typeof playerData[0]>()
  for (const entry of playerData) {
    if (!entry.user) continue
    const email = entry.user.toLowerCase().trim()
    if (!email) continue

    const existing = byEmail.get(email)
    if (!existing) {
      byEmail.set(email, entry)
    } else {
      // Garder l'entrée avec le plus de données remplies
      const existingFilled = Object.values(existing).filter(v => v && v !== "(deleted option)").length
      const newFilled = Object.values(entry).filter(v => v && v !== "(deleted option)").length
      if (newFilled > existingFilled) {
        byEmail.set(email, entry)
      }
    }
  }

  console.log(`📋 ${byEmail.size} emails uniques à traiter (${playerData.length} entrées totales)\n`)

  for (const [email, entry] of byEmail) {
    // Vérifier s'il y a des données utiles
    const hasData = entry["Pied fort"] || entry["Poids"] || entry["Poste ref"] || entry.taille
    if (!hasData) {
      skippedNoData++
      continue
    }

    try {
      // Trouver l'utilisateur par email
      const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true },
      })

      if (!user) {
        console.log(`  ⚠️  Utilisateur non trouvé: ${email}`)
        skippedNotFound++
        continue
      }

      // Trouver le profil joueur (utiliser queryRaw pour éviter les problèmes de colonnes manquantes)
      const profiles = await prisma.$queryRaw<Array<{id: string, primaryPosition: string}>>`
        SELECT "id", "primaryPosition" FROM "PlayerProfile" WHERE "userId" = ${user.id} LIMIT 1
      `
      const profile = profiles[0] || null

      if (!profile) {
        console.log(`  ⚠️  Pas de profil joueur pour: ${email}`)
        skippedNoProfile++
        continue
      }

      // Préparer les données de mise à jour
      const updateData: Record<string, any> = {}

      // Taille
      const height = parseHeight(entry.taille)
      if (height !== null) {
        updateData.height = height
      }

      // Poids
      const weight = parseWeight(entry["Poids"])
      if (weight !== null) {
        updateData.weight = weight
      }

      // Pied fort
      const foot = mapFoot(entry["Pied fort"])
      if (foot) {
        updateData.strongFoot = foot
      }

      // Position principale
      const primaryPos = mapPosition(entry["Poste ref"])
      if (primaryPos) {
        updateData.primaryPosition = primaryPos
      }

      // Positions secondaires (combiner secondaire + ultérieur)
      const secondaryPositions: string[] = []
      const secPos = mapPosition(entry["Poste secondaire"])
      if (secPos && secPos !== primaryPos) {
        secondaryPositions.push(secPos)
      }
      const tertPos = mapPosition(entry["Poste ultérieur"])
      if (tertPos && tertPos !== primaryPos && !secondaryPositions.includes(tertPos)) {
        secondaryPositions.push(tertPos)
      }
      if (secondaryPositions.length > 0) {
        updateData.secondaryPositions = secondaryPositions
      }

      // Ne mettre à jour que s'il y a des données
      if (Object.keys(updateData).length === 0) {
        skippedNoData++
        continue
      }

      // Construire la requête SQL dynamiquement pour éviter le problème de colonne slug
      const setClauses: string[] = []
      const values: any[] = []

      if (updateData.height !== undefined) {
        setClauses.push(`"height" = ${updateData.height}`)
      }
      if (updateData.weight !== undefined) {
        setClauses.push(`"weight" = ${updateData.weight}`)
      }
      if (updateData.strongFoot) {
        setClauses.push(`"strongFoot" = '${updateData.strongFoot}'`)
      }
      if (updateData.primaryPosition) {
        setClauses.push(`"primaryPosition" = '${updateData.primaryPosition}'`)
      }
      if (updateData.secondaryPositions) {
        const arr = updateData.secondaryPositions.map((p: string) => `'${p}'`).join(",")
        setClauses.push(`"secondaryPositions" = ARRAY[${arr}]::text[]`)
      }

      if (setClauses.length > 0) {
        setClauses.push(`"updatedAt" = NOW()`)
        const sql = `UPDATE "PlayerProfile" SET ${setClauses.join(", ")} WHERE "id" = '${profile.id}'`
        await prisma.$executeRawUnsafe(sql)
      }

      const posLabel = updateData.primaryPosition || profile.primaryPosition
      const secLabel = updateData.secondaryPositions?.join(", ") || ""
      console.log(
        `  ✅ ${email} → ${posLabel}${secLabel ? ` [${secLabel}]` : ""} | ${updateData.height || "-"}cm | ${updateData.weight || "-"}kg | ${updateData.strongFoot || "-"}`
      )
      updated++
    } catch (err) {
      console.error(`  ❌ Erreur pour ${email}:`, err)
      errors++
    }
  }

  console.log("\n" + "=".repeat(60))
  console.log(`📊 Résumé:`)
  console.log(`  ✅ Mis à jour:           ${updated}`)
  console.log(`  ⏭️  Ignorés (pas de data): ${skippedNoData}`)
  console.log(`  ⚠️  User non trouvé:      ${skippedNotFound}`)
  console.log(`  ⚠️  Pas de profil:        ${skippedNoProfile}`)
  console.log(`  ❌ Erreurs:              ${errors}`)
  console.log("=".repeat(60))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
