import classNames from 'classnames';

export const HomeLink = () => (
  <div className="brand-dark-form__help-links text-center pt-4">
    &copy; {new Date().getFullYear()}{' '}
    <a
      className={classNames(
        'focus:underline',
        'focus:text-gold-400',
        'hover:underline',
        'hover:text-gold-400',
      )}
      style={{ letterSpacing: '0.02em' }}
      href="https://www.aptible.com/"
    >
      Aptible Inc.
    </a>
  </div>
);
