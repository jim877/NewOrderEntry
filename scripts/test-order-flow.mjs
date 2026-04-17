import fs from "node:fs/promises";

const DEBUG_PORT = Number(process.env.CDP_PORT || 9222);
const APP_URL = process.env.APP_URL || "http://127.0.0.1:5173";

const QUICK_SCREENSHOT = "/tmp/noe-quick-flow.png";
const DETAILED_SCREENSHOT = "/tmp/noe-detailed-flow.png";

const sampleOrder = {
  orderName: "Doheny Fire Loss - DKI",
  leadSourceCategory: "Referral",
  referringCompany: "DKI",
  referrer: "Zack Barsack",
  insuranceCompany: "Pure Insurance",
  insuranceAdjuster: "Ronzel Simmons",
  movingCompany: "Croziers",
  movingContact: "Steven",
  primaryLossType: "Fire",
  secondaryContaminants: ["Water"],
  serviceOfferings: ["Textiles", "Rugs", "Art"],
  customer: {
    first: "Dedrie",
    last: "Doheny",
    phone: "973-650-9169",
  },
  spouse: {
    first: "Mark",
    last: "Doheny II",
    email: "MDoh23@gmail.com",
  },
  address: {
    street: "25 Main Street",
    city: "Bloomingdale",
    state: "NJ",
    zip: "07403",
  },
  schedule: {
    type: "Scope",
    date: "2026-04-18",
    time: "12:00 PM",
  },
  quickNotes:
    "Battery fire started in the basement with water also in the basement. Nothing is wet now. Home is boarded up with no electricity. Customer is elderly, does not text, has a Shih Tzu named Spot, and air-dries all clothing. Need to pack out rugs, draperies including rods, and all clothing.",
  detailedNotes:
    "Caller is Zack Barsack from DKI. Adjuster is Ronzel Simmons from Pure. Mover is Steven from Croziers. Customer will be out of the house for 1 year or longer and needs storage until move-back. Cleaning textiles, rugs, and art. Refinish floors and paint will be needed. Husband Mark Doheny II email: MDoh23@gmail.com. Dog on premises: Spot (Shih Tzu). Customer air-dries all clothing. Pack out all rugs, draperies including rods, and pick up all clothing.",
};

class CdpSession {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.events = [];
  }

  async connect() {
    this.socket = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.socket.addEventListener("open", resolve, { once: true });
      this.socket.addEventListener("error", reject, { once: true });
    });
    this.socket.addEventListener("message", (event) => {
      const payload = JSON.parse(event.data.toString());
      if (payload.id && this.pending.has(payload.id)) {
        const { resolve, reject } = this.pending.get(payload.id);
        this.pending.delete(payload.id);
        if (payload.error) reject(new Error(payload.error.message));
        else resolve(payload.result);
        return;
      }
      this.events.push(payload);
    });
  }

  async send(method, params = {}) {
    const id = this.nextId++;
    const message = JSON.stringify({ id, method, params });
    const response = new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
    this.socket.send(message);
    return response;
  }

  async evaluate(expression, { awaitPromise = true, returnByValue = true } = {}) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise,
      returnByValue,
    });
    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text || "Runtime evaluation failed");
    }
    return returnByValue ? result.result.value : result.result;
  }

  async waitFor(expression, timeoutMs = 10000, intervalMs = 150) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
      const passed = await this.evaluate(`Boolean(${expression})`);
      if (passed) return true;
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    throw new Error(`Timed out waiting for: ${expression}`);
  }

  async screenshot(targetPath) {
    const result = await this.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
    });
    await fs.writeFile(targetPath, Buffer.from(result.data, "base64"));
  }

  async close() {
    try {
      this.socket?.close();
    } catch {}
  }
}

async function getWsUrl(appUrl) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 10000) {
    try {
      const response = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === "page" && target.url.startsWith(appUrl));
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`Could not find a Chrome page for ${appUrl}`);
}

function json(value) {
  return JSON.stringify(value);
}

async function installHelpers(cdp) {
  await cdp.evaluate(`
    (() => {
      const setValue = (element, value) => {
        if (!element) return false;
        const tagName = element.tagName;
        const proto =
          tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype :
          tagName === "SELECT" ? HTMLSelectElement.prototype :
          HTMLInputElement.prototype;
        const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
        descriptor?.set?.call(element, value);
        element.dispatchEvent(new Event("input", { bubbles: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
        return true;
      };

      window.__codexTest = {
        clickButton(text) {
          const button = Array.from(document.querySelectorAll("button"))
            .find((node) => node.textContent.replace(/\\s+/g, " ").trim().includes(text));
          if (!button) return false;
          button.click();
          return true;
        },
        setField(field, value) {
          const container = document.querySelector('[data-noe-field="' + field + '"]');
          const target = container?.matches("input, textarea, select")
            ? container
            : container?.querySelector("input, textarea, select");
          return setValue(target, value);
        },
        bodyText() {
          return document.body.innerText;
        },
      };
      return true;
    })()
  `);
}

async function fillQuickMode(cdp) {
  await cdp.evaluate(`window.NOE.setMode("quick")`);
  await cdp.waitFor(`window.NOE.getMode() === "quick"`);

  await cdp.evaluate(`
    (() => {
      const data = window.NOE.getData();
      window.NOE.updateMany({
        orderName: ${json(sampleOrder.orderName)},
        orderNameAuto: false,
        isLead: false,
        leadSourceCategory: ${json(sampleOrder.leadSourceCategory)},
        referringCompany: ${json(sampleOrder.referringCompany)},
        referrer: ${json(sampleOrder.referrer)},
        primaryLossType: ${json(sampleOrder.primaryLossType)},
        secondaryContaminants: ${json(sampleOrder.secondaryContaminants)},
        orderTypes: ${json([sampleOrder.primaryLossType, ...sampleOrder.secondaryContaminants])},
        payorQuick: "Insurance",
        billingPayer: "Insurance",
        involvesInsurance: "Yes",
        insuranceClaim: "Yes",
        insuranceCompany: ${json(sampleOrder.insuranceCompany)},
        insuranceAdjuster: ${json(sampleOrder.insuranceAdjuster)},
        serviceOfferings: ${json(sampleOrder.serviceOfferings)},
        damageWasWet: "N",
        boardedUp: true,
        noLights: true,
        scheduleType: ${json(sampleOrder.schedule.type)},
        pickupDate: ${json(sampleOrder.schedule.date)},
        pickupTime: ${json(sampleOrder.schedule.time)},
        eventFirm: true,
        vendors: [
          {
            id: "vendor-mover",
            company: ${json(sampleOrder.movingCompany)},
            contact: ${json(sampleOrder.movingContact)},
            type: "Moving",
            incomplete: false,
          }
        ],
        eventInstructions: ${json(sampleOrder.quickNotes)},
      });
      window.NOE.update("customers[0].first", ${json(sampleOrder.customer.first)});
      window.NOE.update("customers[0].last", ${json(sampleOrder.customer.last)});
      window.NOE.update("customers[0].phone", ${json(sampleOrder.customer.phone)});
      window.NOE.update("addresses[0].street", ${json(sampleOrder.address.street)});
      window.NOE.update("addresses[0].city", ${json(sampleOrder.address.city)});
      window.NOE.update("addresses[0].state", ${json(sampleOrder.address.state)});
      window.NOE.update("addresses[0].zip", ${json(sampleOrder.address.zip)});
      return window.NOE.getData();
    })()
  `);

  await cdp.waitFor(`window.NOE.getFieldValue("customers[0].first") === ${json(sampleOrder.customer.first)}`);
  await cdp.screenshot(QUICK_SCREENSHOT);

  return cdp.evaluate(`
    (() => {
      const data = window.NOE.getData();
      return {
        mode: window.NOE.getMode(),
        orderName: data.orderName,
        isLead: data.isLead,
        loss: [data.primaryLossType, ...(data.secondaryContaminants || [])].filter(Boolean),
        payorQuick: data.payorQuick,
        customer: data.customers?.[0] || null,
        address: data.addresses?.[0] || null,
        serviceOfferings: data.serviceOfferings || [],
        vendors: data.vendors || [],
        pickupDate: data.pickupDate,
        pickupTime: data.pickupTime,
        conditions: {
          damageWasWet: data.damageWasWet,
          boardedUp: data.boardedUp,
          noLights: data.noLights,
        },
        eventInstructions: data.eventInstructions,
      };
    })()
  `);
}

async function switchToDetailed(cdp) {
  const clicked = await cdp.evaluate(`window.__codexTest.clickButton("Switch to Detailed")`);
  if (!clicked) {
    throw new Error('Could not find "Switch to Detailed" button');
  }
  await cdp.waitFor(`window.NOE.getMode() === "detailed"`);
}

async function fillDetailedMode(cdp) {
  await cdp.evaluate(`
    (() => {
      const current = window.NOE.getData();
      const primary = { ...(current.customers?.[0] || {}) };
      primary.first = ${json(sampleOrder.customer.first)};
      primary.last = ${json(sampleOrder.customer.last)};
      primary.phone = ${json(sampleOrder.customer.phone)};
      primary.type = primary.type || "Primary";
      primary.isPrimary = true;

      const spouse = {
        ...primary,
        id: "customer-spouse-mark",
        first: ${json(sampleOrder.spouse.first)},
        last: ${json(sampleOrder.spouse.last)},
        email: ${json(sampleOrder.spouse.email)},
        phone: "",
        isPrimary: false,
        type: "Spouse",
      };

      const mover = {
        id: "vendor-mover",
        company: ${json(sampleOrder.movingCompany)},
        contact: ${json(sampleOrder.movingContact)},
        type: "Moving",
        incomplete: false,
      };

      window.NOE.updateMany({
        orderName: ${json(sampleOrder.orderName)},
        orderNameAuto: false,
        isLead: false,
        leadSourceCategory: ${json(sampleOrder.leadSourceCategory)},
        referringCompany: ${json(sampleOrder.referringCompany)},
        referrer: ${json(sampleOrder.referrer)},
        contactMethod: "Call",
        primaryLossType: ${json(sampleOrder.primaryLossType)},
        secondaryContaminants: ${json(sampleOrder.secondaryContaminants)},
        orderTypes: ${json([sampleOrder.primaryLossType, ...sampleOrder.secondaryContaminants])},
        serviceOfferings: ${json(sampleOrder.serviceOfferings)},
        insuranceClaim: "Yes",
        involvesInsurance: "Yes",
        billingPayer: "Insurance",
        insuranceCompany: ${json(sampleOrder.insuranceCompany)},
        insuranceAdjuster: ${json(sampleOrder.insuranceAdjuster)},
        vendors: [mover],
        damageWasWet: "N",
        boardedUp: true,
        noLights: true,
        livingStatus: "Temporarily displaced",
        processType: "Long-Term Storage",
        storageNeeded: "Y",
        storageMonths: "12",
        repairsSummary: "Refinish floors and paint.",
        pickupDate: ${json(sampleOrder.schedule.date)},
        pickupTime: ${json(sampleOrder.schedule.time)},
        scheduleType: ${json(sampleOrder.schedule.type)},
        eventFirm: true,
        customers: [primary, spouse],
        householdAnimals: "Spot (Shih Tzu)",
        sdsConsiderations: ["Elderly"],
        sdsObservations: ["Pets"],
        eventInstructions: ${json(sampleOrder.detailedNotes)},
      });

      window.NOE.update("addresses[0].street", ${json(sampleOrder.address.street)});
      window.NOE.update("addresses[0].city", ${json(sampleOrder.address.city)});
      window.NOE.update("addresses[0].state", ${json(sampleOrder.address.state)});
      window.NOE.update("addresses[0].zip", ${json(sampleOrder.address.zip)});
      return window.NOE.getData();
    })()
  `);

  await cdp.waitFor(`window.NOE.getData().customers?.length > 1`);
  await cdp.screenshot(DETAILED_SCREENSHOT);

  return cdp.evaluate(`
    (() => {
      const data = window.NOE.getData();
      return {
        mode: window.NOE.getMode(),
        orderName: data.orderName,
        leadSourceCategory: data.leadSourceCategory,
        referringCompany: data.referringCompany,
        referrer: data.referrer,
        insuranceCompany: data.insuranceCompany,
        insuranceAdjuster: data.insuranceAdjuster,
        serviceOfferings: data.serviceOfferings || [],
        vendors: data.vendors || [],
        customers: data.customers || [],
        address: data.addresses?.[0] || null,
        storageNeeded: data.storageNeeded,
        storageMonths: data.storageMonths,
        processType: data.processType,
        repairsSummary: data.repairsSummary,
        sdsConsiderations: data.sdsConsiderations || [],
        sdsObservations: data.sdsObservations || [],
        pickupDate: data.pickupDate,
        pickupTime: data.pickupTime,
        eventInstructions: data.eventInstructions,
      };
    })()
  `);
}

async function main() {
  const wsUrl = await getWsUrl(APP_URL);
  const cdp = new CdpSession(wsUrl);
  await cdp.connect();

  try {
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 2200,
      deviceScaleFactor: 1,
      mobile: false,
    });
    await cdp.send("Page.bringToFront");
    await cdp.waitFor(`document.readyState === "complete"`);
    await cdp.waitFor(`typeof window.NOE === "object"`);
    await installHelpers(cdp);

    const quick = await fillQuickMode(cdp);
    await switchToDetailed(cdp);
    const detailed = await fillDetailedMode(cdp);

    const bodyText = await cdp.evaluate(`window.__codexTest.bodyText().slice(0, 5000)`);

    console.log(JSON.stringify({
      appUrl: APP_URL,
      screenshots: {
        quick: QUICK_SCREENSHOT,
        detailed: DETAILED_SCREENSHOT,
      },
      quick,
      detailed,
      bodyText,
    }, null, 2));
  } finally {
    await cdp.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
