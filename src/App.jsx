import React, { useEffect, useRef, useState } from 'react';
import { ForestMark, Icon } from './Marks.jsx';
import { countdown, shortTime } from './night.js';
import useNight from './useNight.js';
import useChime from './useChime.js';
import cabin from './assets/stillwood-cabin.png';

const demo = new URLSearchParams(window.location.search).get('demo') === '1';
const dateLabel = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
const titles = { plan: 'Plan your night', wait: 'Until bedtime', bed: 'It’s now time for bed', sleep: 'Until wake-up', wake: 'Time to wake up' };

function inputTime(stamp) {
  const date = new Date(stamp);
  return [date.getHours(), date.getMinutes()].map(part => String(part).padStart(2, '0')).join(':');
}

function TimeRow({name, icon, title, value, setValue}) {
  return <label className="time-row" htmlFor={name}>
    <span className="row-icon"><Icon name={icon} size={22}/></span>
    <span className="time-name">{title}</span>
    <span className="time-field">
      <input id={name} type="time" aria-label={title} required value={value} onChange={event => setValue(event.target.value)}/>
      <i aria-hidden="true" className="chevron"/>
    </span>
  </label>;
}

function PlanForm({night, onSave, onCancel}) {
  const [bed, setBed] = useState(() => night ? inputTime(night.bedAt) : '23:00');
  const [wake, setWake] = useState(() => night ? inputTime(night.wakeAt) : (demo ? '23:25' : '07:00'));
  function submit(event) {
    event.preventDefault();
    onSave(bed, wake);
  }
  return <form onSubmit={submit}>
    <div className="time-list">
      <TimeRow name="bedtime" title="Bedtime" icon="moon" value={bed} setValue={setBed}/>
      <TimeRow name="wake-time" title="Wake-up" icon="sun" value={wake} setValue={setWake}/>
    </div>
    <button className="action primary" type="submit">{night ? 'Save times' : 'Begin my night'}<Icon name="sparkle" size={18}/></button>
    {night && <button type="button" className="text-button cancel" onClick={onCancel}>Keep current times</button>}
  </form>;
}

function ClockFace({target, now}) {
  const digits = countdown(target, now);
  const units = ['hours', 'minutes', 'seconds'];
  return <div className="countdown" role="timer" aria-live="off" aria-label={digits.map((v,i) => Number(v) + ' ' + units[i]).join(', ')}>
    {digits.map((value,i) => <React.Fragment key={units[i]}>
      {i > 0 && <span className="colon" aria-hidden="true">:</span>}
      <div className="digit-group" aria-hidden="true"><strong>{value}</strong><small>{units[i]}</small></div>
    </React.Fragment>)}
  </div>;
}

function Reminder({icon, heading, detail}) {
  return <aside className="notice" role="status" aria-live="polite" aria-atomic="true">
    <span className="notice-icon"><Icon name={icon}/></span>
    <span><strong>{heading}</strong><small>{detail}</small></span>
  </aside>;
}

export default function App() {
  const { night, now, phase, begin, act } = useNight(demo);
  const audio = useChime(phase, demo);
  const [edit, setEdit] = useState(false);
  const [message, setMessage] = useState(null);
  const titleRef = useRef(null);
  const editing = edit && phase === 'wait';
  const planning = phase === 'plan' || editing;
  const lastPhase = useRef(phase);
  const title = editing ? 'Change your times' : titles[phase];

  useEffect(() => {
    if (lastPhase.current !== phase) {
      titleRef.current?.focus({ preventScroll: true });
      lastPhase.current = phase;
      setEdit(false);
    }
    document.title = phase === 'plan' ? 'Stillwood · Bedside clock' : titles[phase] + ' · Stillwood';
  }, [phase]);

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [message]);

  function savePlan(bed, wake) {
    audio.stop();
    void audio.enable();
    setMessage(null);
    setEdit(false);
    begin(bed, wake);
  }
  function choose(action) {
    setMessage(null);
    if (action === 'awake') audio.stop();
    else void audio.enable();
    if (action === 'in-bed') setMessage({icon:'moon', heading:'Now going to sleep', detail:'Wake-up is set for ' + shortTime(night.wakeAt) + '.'});
    act(action);
  }

  let notice = message;
  if (phase === 'bed') notice = { icon:'moon', heading: night.reminderAt > night.bedAt ? 'Your follow-up reminder' : 'Bedtime reminder', detail:'It’s now time for bed.' };
  if (phase === 'wake') notice = { icon:'sun', heading:'Wake-up alarm', detail: audio.ringing ? 'Morning chime playing · ' + shortTime(night.wakeAt) : 'Your ' + shortTime(night.wakeAt) + ' wake-up time is here.' };
  const needsSound = phase !== 'plan' && !audio.ready;
  const previewAllowed = phase === 'plan';
  const soundTitle = audio.previewing ? 'Stop sound preview' : 'Preview wake-up chime';

  return <div className="desk">
    {notice && <Reminder key={notice.heading} {...notice}/>}
    <div className="bedside">
      <header className="masthead">
        <div className="brand"><ForestMark/><span>Stillwood</span></div>
        {previewAllowed ? <button type="button" className="sound-button" aria-label={soundTitle} title={soundTitle}
          aria-pressed={audio.previewing} onClick={audio.preview}><Icon name={audio.previewing ? 'stop' : 'sound'} size={19}/></button> :
          needsSound && (phase === 'wait' || phase === 'sleep') ? <button type="button" className="enable" onClick={audio.enable}><Icon name="sound" size={16}/>Enable sound</button> :
          <span className="header-status"><Icon name={phase === 'wake' ? 'sun' : 'moon'} size={17}/></span>}
      </header>

      <div className="woodcut">
        <img src={cabin} alt="A small cabin with lit windows beside a quiet mountain lake, framed by pines and a crescent moon." width="1280" height="640" fetchPriority="high"/>
        <span className="print-line" aria-hidden="true"/>
      </div>

      <main className="main-content">
        <div className="dateline"><span>{demo ? 'Class demo · 60× time' : dateLabel.format(now)}</span><i/><b aria-hidden="true">✧</b></div>
        <h1 className={phase === 'bed' ? 'bed-heading' : ''} ref={titleRef} tabIndex="-1">{title}</h1>
        {planning ? <PlanForm key={editing ? 'edit' : 'new'} night={editing ? night : null} onSave={savePlan} onCancel={() => setEdit(false)}/> : <>
          {(phase === 'wait' || phase === 'sleep') && <>
            <ClockFace target={phase === 'sleep' ? night.wakeAt : night.reminderAt} now={now}/>
            <div className="schedule-note">
              <span className="row-icon"><Icon name={phase === 'sleep' ? 'sun' : 'moon'} size={20}/></span>
              <div><small>{phase === 'sleep' ? 'Wake-up alarm' : (night.reminderAt > night.bedAt ? 'Next reminder' : 'Bedtime reminder')}</small>
                <strong>{shortTime(phase === 'sleep' ? night.wakeAt : night.reminderAt)}</strong></div>
              {phase === 'wait' && <button className="edit-button" onClick={() => setEdit(true)} type="button" aria-label="Change planned times" title="Change planned times"><Icon name="pencil" size={17}/></button>}
            </div>
          </>}
          {phase === 'bed' && <div className="decisions">
            <button type="button" className="action primary" onClick={() => choose('in-bed')}>I’m now in bed<Icon name="moon" size={18}/></button>
            <button type="button" className="action secondary" onClick={() => choose('later')}>Remind me in 10 minutes<Icon name="repeat" size={18}/></button>
          </div>}
          {phase === 'wake' && <div className="decisions">
            <button type="button" className="action primary" onClick={() => choose('awake')}>I’m awake<Icon name="sun" size={19}/></button>
            {needsSound && <button type="button" className="action secondary" onClick={audio.enable}>Enable alarm sound<Icon name="sound" size={18}/></button>}
          </div>}
        </>}
        {audio.audioError && <p className="sound-error" role="status">{audio.audioError}</p>}
        <footer className="footnote"><span className="stitched-rule" aria-hidden="true"/><p><Icon name="bell" size={15}/>
          {demo ? 'One second here is one minute in the demo.' : 'Keep this tab open for your alarm.'}</p></footer>
      </main>
    </div>
  </div>;
}
