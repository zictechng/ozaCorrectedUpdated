// ─────────────────────────────────────────────────
// dataPlansList.js
// Data plans per network.
//
// IMPORTANT — API CODES:
// Each plan has codes for BOTH providers:
//   bigisub_code → for Bigisub.ng API
//   cdh_plan_id  → for CheapDataHub API (numeric)
//
// The backend decides which provider to use.
// Frontend just passes the plan ID and the
// backend routes to the correct provider.
//
// TO UPDATE: When you register on Bigisub or
// CheapDataHub, check their plan list page
// and update the codes here. Only this file
// needs changing — no screen code changes.
// ─────────────────────────────────────────────────

export const DATA_PLANS = {
  MTN: [
    {
      id: 'mtn_100mb',
      label: '100MB',
      validity: '1 Day',
      price: '100',
      bigisub_code: 'MTN-SME-100MB',   // update after Bigisub registration
      cdh_plan_id: null,                // update after CheapDataHub registration
    },
    {
      id: 'mtn_500mb',
      label: '500MB',
      validity: '30 Days',
      price: '250',
      bigisub_code: 'MTN-SME-500MB',
      cdh_plan_id: null,
    },
    {
      id: 'mtn_1gb',
      label: '1GB',
      validity: '30 Days',
      price: '399',
      bigisub_code: 'MTN-SME-1GB',
      cdh_plan_id: null,
    },
    {
      id: 'mtn_2gb',
      label: '2GB',
      validity: '30 Days',
      price: '750',
      bigisub_code: 'MTN-SME-2GB',
      cdh_plan_id: null,
    },
    {
      id: 'mtn_3gb',
      label: '3GB',
      validity: '30 Days',
      price: '1100',
      bigisub_code: 'MTN-SME-3GB',
      cdh_plan_id: null,
    },
    {
      id: 'mtn_5gb',
      label: '5GB',
      validity: '30 Days',
      price: '1900',
      bigisub_code: 'MTN-SME-5GB',
      cdh_plan_id: null,
    },
    {
      id: 'mtn_10gb',
      label: '10GB',
      validity: '30 Days',
      price: '3500',
      bigisub_code: 'MTN-SME-10GB',
      cdh_plan_id: null,
    },
    {
      id: 'mtn_20gb',
      label: '20GB',
      validity: '30 Days',
      price: '6500',
      bigisub_code: 'MTN-SME-20GB',
      cdh_plan_id: null,
    },
  ],

  Airtel: [
    {
      id: 'airtel_100mb',
      label: '100MB',
      validity: '1 Day',
      price: '100',
      bigisub_code: 'Airtel-SME-100MB',
      cdh_plan_id: null,
    },
    {
      id: 'airtel_500mb',
      label: '500MB',
      validity: '30 Days',
      price: '300',
      bigisub_code: 'Airtel-SME-500MB',
      cdh_plan_id: null,
    },
    {
      id: 'airtel_1gb',
      label: '1GB',
      validity: '30 Days',
      price: '500',
      bigisub_code: 'Airtel-SME-1GB',
      cdh_plan_id: null,
    },
    {
      id: 'airtel_2gb',
      label: '2GB',
      validity: '30 Days',
      price: '900',
      bigisub_code: 'Airtel-SME-2GB',
      cdh_plan_id: null,
    },
    {
      id: 'airtel_3gb',
      label: '3GB',
      validity: '30 Days',
      price: '1400',
      bigisub_code: 'Airtel-SME-3GB',
      cdh_plan_id: null,
    },
    {
      id: 'airtel_5gb',
      label: '5GB',
      validity: '30 Days',
      price: '2000',
      bigisub_code: 'Airtel-SME-5GB',
      cdh_plan_id: null,
    },
    {
      id: 'airtel_10gb',
      label: '10GB',
      validity: '30 Days',
      price: '3800',
      bigisub_code: 'Airtel-SME-10GB',
      cdh_plan_id: null,
    },
    {
      id: 'airtel_20gb',
      label: '20GB',
      validity: '30 Days',
      price: '7000',
      bigisub_code: 'Airtel-SME-20GB',
      cdh_plan_id: null,
    },
  ],

  Glo: [
    {
      id: 'glo_200mb',
      label: '200MB',
      validity: '1 Day',
      price: '100',
      bigisub_code: 'Glo-CG-200MB',
      cdh_plan_id: null,
    },
    {
      id: 'glo_500mb',
      label: '500MB',
      validity: '30 Days',
      price: '225',
      bigisub_code: 'Glo-CG-500MB',
      cdh_plan_id: null,
    },
    {
      id: 'glo_1gb',
      label: '1GB',
      validity: '30 Days',
      price: '300',
      bigisub_code: 'Glo-CG-1GB',
      cdh_plan_id: null,
    },
    {
      id: 'glo_2gb',
      label: '2GB',
      validity: '30 Days',
      price: '700',
      bigisub_code: 'Glo-CG-2GB',
      cdh_plan_id: null,
    },
    {
      id: 'glo_3gb',
      label: '3GB',
      validity: '30 Days',
      price: '1100',
      bigisub_code: 'Glo-CG-3GB',
      cdh_plan_id: null,
    },
    {
      id: 'glo_5gb',
      label: '5GB',
      validity: '30 Days',
      price: '1800',
      bigisub_code: 'Glo-CG-5GB',
      cdh_plan_id: null,
    },
    {
      id: 'glo_10gb',
      label: '10GB',
      validity: '30 Days',
      price: '3200',
      bigisub_code: 'Glo-CG-10GB',
      cdh_plan_id: null,
    },
    {
      id: 'glo_20gb',
      label: '20GB',
      validity: '30 Days',
      price: '6000',
      bigisub_code: 'Glo-CG-20GB',
      cdh_plan_id: null,
    },
  ],

  '9mobile': [
    {
      id: '9mobile_150mb',
      label: '150MB',
      validity: '1 Day',
      price: '100',
      bigisub_code: '9mobile-150MB',
      cdh_plan_id: null,
    },
    {
      id: '9mobile_500mb',
      label: '500MB',
      validity: '30 Days',
      price: '300',
      bigisub_code: '9mobile-500MB',
      cdh_plan_id: null,
    },
    {
      id: '9mobile_1gb',
      label: '1GB',
      validity: '30 Days',
      price: '500',
      bigisub_code: '9mobile-1GB',
      cdh_plan_id: null,
    },
    {
      id: '9mobile_2gb',
      label: '2GB',
      validity: '30 Days',
      price: '900',
      bigisub_code: '9mobile-2GB',
      cdh_plan_id: null,
    },
    {
      id: '9mobile_3gb',
      label: '3GB',
      validity: '30 Days',
      price: '1400',
      bigisub_code: '9mobile-3GB',
      cdh_plan_id: null,
    },
    {
      id: '9mobile_5gb',
      label: '5GB',
      validity: '30 Days',
      price: '2000',
      bigisub_code: '9mobile-5GB',
      cdh_plan_id: null,
    },
    {
      id: '9mobile_10gb',
      label: '10GB',
      validity: '30 Days',
      price: '3800',
      bigisub_code: '9mobile-10GB',
      cdh_plan_id: null,
    },
    {
      id: '9mobile_20gb',
      label: '20GB',
      validity: '30 Days',
      price: '7500',
      bigisub_code: '9mobile-20GB',
      cdh_plan_id: null,
    },
  ],
};

export const getDataPlans = (networkId) =>
  DATA_PLANS[networkId] || [];

export const getPlanById = (networkId, planId) =>
  DATA_PLANS[networkId]?.find((p) => p.id === planId) || null;