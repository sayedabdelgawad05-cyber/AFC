import React, { useEffect, useState } from 'react';

export default function DashboardAnalytics() {
  const [observations, setObservations] = useState<any[]>([]);
  const [drawings, setDrawings] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [rfis, setRfis] = useState<any[]>([]);
  const [ncrs, setNcrs] = useState<any[]>([]);
  const [punches, setPunches] = useState<any[]>([]);

  useEffect(() => {
    setObservations(JSON.parse(localStorage.getItem('hsr_observations') || '[]'));
    setDrawings(JSON.parse(localStorage.getItem('hsr_drawings') || '[]'));
    setDocuments(JSON.parse(localStorage.getItem('hsr_documents') || '[]'));
    setRfis(JSON.parse(localStorage.getItem('hsr_rfis') || '[]'));
    setNcrs(JSON.parse(localStorage.getItem('hsr_ncrs') || '[]'));
    setPunches(JSON.parse(localStorage.getItem('hsr_punches') || '[]'));
  }, []);

  const openObservations = observations.filter(
    item => item.status === 'Open'
  ).length;

  const closedObservations = observations.filter(
    item => item.status === 'Closed'
  ).length;

  const closureRate =
    observations.length > 0
      ? Math.round(
          (closedObservations / observations.length) * 100
        )
      : 0;

  const openRfis = rfis.filter(
    item => item.status === 'Open'
  ).length;

  const openNcrs = ncrs.filter(
    item => item.status === 'Open'
  ).length;

  const openPunches = punches.filter(
    item => item.status === 'Open'
  ).length;

  const underReviewDrawings = drawings.filter(
    item => item.status === 'Under Review'
  ).length;

  const supersededDrawings = drawings.filter(
    item => item.status === 'Superseded'
  ).length;

  const drawingRiskIndex =
    drawings.length > 0
      ? Math.round(
          ((underReviewDrawings + supersededDrawings) /
            drawings.length) *
            100
        )
      : 0;

  const totalProjectRecords =
    observations.length +
    drawings.length +
    documents.length +
    rfis.length +
    ncrs.length +
    punches.length;

  const projectHealthScore = Math.max(
    0,
    100 -
      openObservations * 2 -
      openRfis * 3 -
      openNcrs * 5 -
      openPunches * 