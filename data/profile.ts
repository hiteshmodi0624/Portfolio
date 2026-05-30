export interface Metric {
  value: number;
  suffix: string;
  label: string;
}

export interface ProfileLinks {
  resume: string;
  github: string;
  linkedIn: string;
  twitter: string;
  email: string;
}

const profileData = {
  name: 'Hitesh Modi',
  title: 'Engineer & Founder',
  tagline: 'I write architecture-first code, ship fast with AI, and build products people pay for.',
  badge: 'Open to opportunities',
  metrics: [
    { value: 4000, suffix: '+', label: 'commits shipped' },
    { value: 1, suffix: 'M+', label: 'req/day (AWS)' },
    { value: 2, suffix: '+', label: 'years production' },
  ] as Metric[],
  links: {
    resume: 'https://drive.google.com/file/d/1ICaJ8Y_MqiH1mFr226WENrmY-t-l0K-P/edit',
    github: 'https://github.com/hiteshmodi0624',
    linkedIn: 'https://linkedin.com/in/hiteshmodi0624',
    twitter: 'https://twitter.com/hiteshmodi_',
    email: 'mailto:mail@hiteshmodi.in',
  } as ProfileLinks,
};

export default profileData;
