import style from './header.module.scss';
import Link from 'next/link';
export default function Header() {
  return (
    <header className={style.container} >
      <div>
        <Link href="/">
          <a>
            <img alt="logo" src='/images/logo.png' />
          </a>
        </Link>
      </div>
    </header>
  )
}
