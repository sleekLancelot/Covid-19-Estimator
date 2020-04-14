const UI = (() => {
  const selectors = {
    card1: '#card1',
    imgBox1: '#iBox1',
    card2: '#card2',
    imgBox2: '#iBox2',
    menuBTN: '.menu-btn',
    modal: '#mod',
    form: '#input-form',
    submitModal: '.submit',
    closeModal: '.closeModal',
    region: 'form input#place',
    age: 'form input#age',
    income: 'form input#income',
    earners: 'form input#earners',
    timeCount: 'input[data-time-to-elapse]',
    reported: 'input[data-reported-cases]',
    population: 'input[data-population]',
    beds: 'input[data-total-hospital-beds]'
  };

  const UISelector = {
    // Data Selectors
    dataName: 'span#showName',
    dataAge: 'span#showAge',
    dataDailyIncome: 'span#showIncome',
    dataDailyEarners: 'span#showDailyEarners',
    dataPeriodType: 'span#showPeriodType',
    dataTime: 'span#showTimeElapsed',
    dataRCases: 'span#showCases',
    dataPopulation: 'span#showPopulation',
    dataBeds: 'span#showBedsRemaining',
    // Impact Selectors
    I_Infected: 'span#I_Infected',
    I_WithInTime: 'span#I_WithInTime',
    I_SevereInfected: 'span#I_SevereInfected',
    I_BedsRemaining: 'span#I_BedsRemaining',
    I_ToICU: 'span#I_ToICU',
    I_Vent: 'span#I_Ventilators',
    I_MonyLost: 'span#I_MonyLost',
    // Severe-Impact Selectors
    SI_Infected: 'span#SI_Infected',
    SI_WithInTime: 'span#SI_WithInTime',
    SI_SevereInfected: 'span#SI_SevereInfected',
    SI_BedsRemaining: 'span#SI_BedsRemaining',
    SI_ToICU: 'span#SI_ToICU',
    SI_Vent: 'span#SI_Ventilators',
    SI_MonyLost: 'span#SI_MonyLost'
  };

  return {
    getSelectors: selectors,
    UISelector,
    getInputValues() {
      const place = document.querySelector(selectors.region);
      const Age = document.querySelector(selectors.age);
      const dailyIncome = document.querySelector(selectors.income);
      const dailyEarners = document.querySelector(selectors.earners);
      const ElapsedTime = document.querySelector(selectors.timeCount);
      const CasesReported = document.querySelector(selectors.reported);
      const pplt = document.querySelector(selectors.population);
      const bedsAvailable = document.querySelector(selectors.beds);

      return {
        place,
        Age,
        dailyIncome,
        dailyEarners,
        ElapsedTime,
        CasesReported,
        pplt,
        bedsAvailable
      };
    },
    clearInputs() {
      document.querySelector(selectors.region).value = '';
      document.querySelector(selectors.age).value = '';
      document.querySelector(selectors.income).value = '';
      document.querySelector(selectors.earners).value = '';
      document.querySelector(selectors.timeCount).value = '';
      document.querySelector(selectors.reported).value = '';
      document.querySelector(selectors.population).value = '';
      document.querySelector(selectors.beds).value = '';
    }
  };
})();

const {
  place,
  Age,
  dailyIncome,
  dailyEarners,
  ElapsedTime,
  CasesReported,
  pplt,
  bedsAvailable
} = UI.getInputValues();

const pType = () => 'days';

function normalizeToDays(periodType) {
  const periodCount = Number(ElapsedTime.value);

  switch (periodType) {
    case 'days':
      return periodCount;
    case 'weeks':
      return periodCount * 7;
    case 'months':
      return periodCount * 30;
    default:
      return periodCount;
  }
}

const covid19ImpactEstimator = () => {
  const days = normalizeToDays(pType()) || 38;
  const drc = Number(CasesReported.value) || 2747;
  const bed = Number(bedsAvailable.value) || 678874;
  const factor = Math.trunc(days / 3);
  const dolsPerDay = Number(dailyIncome.value) || 4;
  const perDayEarners = (Number(dailyEarners.value) / 100) || 0.73;
  const infectionsByRequestedTime = Math.trunc((drc * 10) * (2 ** factor));
  const SInfectionsByRequestedTime = Math.trunc((drc * 50) * (2 ** factor));

  return {
    data: {
      region: {
        name: place.value || 'Africa',
        avgAge: Number(Age.value) || 19.7,
        avgDailyIncomeInUSD: Number(dailyIncome.value) || 4,
        avgDailyIncomePopulation: Number(dailyEarners.value) || 73
      },
      periodType: pType() || 'days',
      timeToElapse: Number(ElapsedTime.value) || 38,
      reportedCases: Number(CasesReported.value) || 2747,
      population: Number(pplt.value) || 92931687,
      totalHospitalBeds: Number(bedsAvailable.value) || 678874
    },
    impact: {
      currentlyInfected: Math.trunc(drc * 10),
      infectionsByRequestedTime,
      severeCasesByRequestedTime: Math.trunc(0.15 * infectionsByRequestedTime),
      hospitalBedsByRequestedTime: Math.trunc((0.35 * bed) - (0.15 * infectionsByRequestedTime)),
      casesForICUByRequestedTime: Math.trunc(0.05 * infectionsByRequestedTime),
      casesForVentilatorsByRequestedTime: Math.trunc(0.02 * infectionsByRequestedTime),
      dollarsInFlight: Math.trunc((infectionsByRequestedTime * perDayEarners * dolsPerDay) / days)
    },
    severeImpact: {
      currentlyInfected: Math.trunc(drc * 50),
      infectionsByRequestedTime: SInfectionsByRequestedTime,
      severeCasesByRequestedTime: Math.trunc(0.15 * SInfectionsByRequestedTime),
      hospitalBedsByRequestedTime: Math.trunc((0.35 * bed) - (0.15 * SInfectionsByRequestedTime)),
      casesForICUByRequestedTime: Math.trunc(0.05 * SInfectionsByRequestedTime),
      casesForVentilatorsByRequestedTime: Math.trunc(0.02 * SInfectionsByRequestedTime),
      dollarsInFlight: Math.trunc((SInfectionsByRequestedTime * perDayEarners * dolsPerDay) / days)
    }
  };
};

const PopulateTheUI = () => {
  const sel = UI.UISelector;
  const feed = covid19ImpactEstimator().data;
  const Impact = covid19ImpactEstimator().impact;
  const SImpact = covid19ImpactEstimator().severeImpact;

  // Data
  document.querySelector(sel.dataName).textContent = feed.region.name;
  document.querySelector(sel.dataAge).textContent = feed.region.avgAge;
  document.querySelector(sel.dataDailyIncome).textContent = feed.region.avgDailyIncomeInUSD;
  document.querySelector(sel.dataDailyEarners).textContent = feed.region.avgDailyIncomePopulation;
  document.querySelector(sel.dataPeriodType).textContent = feed.periodType;
  document.querySelector(sel.dataTime).textContent = feed.timeToElapse;
  document.querySelector(sel.dataRCases).textContent = feed.reportedCases;
  document.querySelector(sel.dataPopulation).textContent = feed.population;
  document.querySelector(sel.dataBeds).textContent = feed.totalHospitalBeds;

  // Impact
  document.querySelector(sel.I_Infected).textContent = Impact.currentlyInfected;
  document.querySelector(sel.I_WithInTime).textContent = Impact.infectionsByRequestedTime;
  document.querySelector(sel.I_SevereInfected).textContent = Impact.severeCasesByRequestedTime;
  document.querySelector(sel.I_BedsRemaining).textContent = Impact.hospitalBedsByRequestedTime;
  document.querySelector(sel.I_ToICU).textContent = Impact.casesForICUByRequestedTime;
  document.querySelector(sel.I_Vent).textContent = Impact.casesForVentilatorsByRequestedTime;
  document.querySelector(sel.I_MonyLost).textContent = Impact.dollarsInFlight;

  // Severe Impact
  document.querySelector(sel.SI_Infected).textContent = SImpact.currentlyInfected;
  document.querySelector(sel.SI_WithInTime).textContent = SImpact.infectionsByRequestedTime;
  document.querySelector(sel.SI_SevereInfected).textContent = SImpact.severeCasesByRequestedTime;
  document.querySelector(sel.SI_BedsRemaining).textContent = SImpact.hospitalBedsByRequestedTime;
  document.querySelector(sel.SI_ToICU).textContent = SImpact.casesForICUByRequestedTime;
  document.querySelector(sel.SI_Vent).textContent = SImpact.casesForVentilatorsByRequestedTime;
  document.querySelector(sel.SI_MonyLost).textContent = SImpact.dollarsInFlight;
};

const App = ((inp) => {
  const loadEventListeners = () => {
    const selectors = UI.getSelectors;

    // Once the from is Submitted
    document.querySelector(selectors.submitModal).addEventListener('click', (e) => {
      // pType();
      PopulateTheUI();

      e.preventDefault();
    });

    // show/hide Impact
    document.querySelector(selectors.card1).addEventListener('click', () => {
      document.querySelector(selectors.imgBox1).classList.toggle('clicked');
    });
    // show/hide Severe Impact
    document.querySelector(selectors.card2).addEventListener('click', () => {
      document.querySelector(selectors.imgBox2).classList.toggle('clicked');
    });

    //  show modal
    document.querySelector(selectors.menuBTN).addEventListener('click', () => {
      document.querySelector(selectors.modal).classList.replace('modalHide', 'modal');
    });

    // hide modal
    document.querySelector(selectors.closeModal).addEventListener('click', (e) => {
      document.querySelector(selectors.modal).classList.replace('modal', 'modalHide');
      inp.clearInputs();
      e.preventDefault();
    });
  };


  return {
    init() {
      loadEventListeners();
      PopulateTheUI();
    }
  };
})(UI);

App.init();


export default covid19ImpactEstimator;
