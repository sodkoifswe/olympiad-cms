# CMS v1.5.1: Ubuntu 24.04 дээр ажиллуулах

GitHub дээр шинэ repo үүсгэхээс эхлээд LAN дээр сервер асааж турших хүртэлх бүрэн дараалал: [START_HERE_MN.md](START_HERE_MN.md). Энэ файл нь Ubuntu талын товч санамж болно.

Энэ repo нь [CMS v1.5.1](https://github.com/cms-dev/cms/releases/tag/v1.5.1)-ийн эх код. Windows компьютер дээр зөвхөн кодыг бэлдэнэ. CMS, PostgreSQL болон `isolate`-ийг тэмцээний Ubuntu сервер дээр ажиллуулна. Оролцогчдын Dev-C++ нь Windows дээрээ байж болно; `.cpp` файлаа браузераар дотоод сүлжээний сервер рүү илгээнэ.

Эхний удаа `git pull` биш, **`git clone --recurse-submodules`** хэрэглэнэ. `isolate` нь Git submodule. Дараа нь код шинэчлэхдээ `git pull` хийж, `git submodule update --init --recursive` ажиллуулна. Энэ repo-гийн суурь commit: `7c9fec8aa1a25ec93d624aebf815804dd93df9db`.

## 1. Ubuntu дээр эх код, шаардлагатай багцууд

Доорх `<YOUR_REPO_URL>`-ийг өөрийн GitHub repo-ийн HTTPS эсвэл SSH URL-аар солино. Ubuntu 24.04-д зориулсан багцуудыг интернэттэй үед урьдчилан татаж суулгана.

```bash
git clone --recurse-submodules --branch olympiad-v1.5.1 <YOUR_REPO_URL> cms
cd cms
git submodule status

sudo apt-get update
sudo apt-get install git build-essential g++ postgresql postgresql-client \
    python3.12 python3.12-venv python3.12-dev python3-pip \
    cgroup-lite libcap-dev libpq-dev libcups2-dev libyaml-dev libffi-dev zip
```

CMS-ийн `docs/Installation.rst`-д нэмэлт хэлний compiler болон хэвлэх үйлчилгээний багцууд бий. Энд C++ бодлого шалгах нэг серверийн эхний тохиргоог үзүүлэв. Өөр Ubuntu хувилбар дээр Python болон багцын нэр өөр байж болно.

## 2. CMS болон sandbox суулгах

`prerequisites.py` нь `isolate`-ийг хөрвүүлж, `cmsuser` үүсгэн, sample тохиргоог `/usr/local/etc/` руу хуулна. `cmsuser` группэд зөвхөн итгэмжлэгдсэн админ хэрэглэгчийг нэмнэ. Группийн өөрчлөлт хүчинтэй болохын тулд гараад дахин нэвтэрнэ.

```bash
sudo python3 prerequisites.py install
python3 -m venv ~/cms_venv
source ~/cms_venv/bin/activate
pip install -r requirements.txt
pip install .
```

## 3. PostgreSQL болон нууц тохиргоо

```bash
sudo -u postgres createuser --pwprompt cmsuser
sudo -u postgres createdb --owner=cmsuser cmsdb
sudo -u postgres psql --dbname=cmsdb --command='ALTER SCHEMA public OWNER TO cmsuser'
sudo -u postgres psql --dbname=cmsdb --command='GRANT SELECT ON pg_largeobject TO cmsuser'
```

`/usr/local/etc/cms.conf` файлын `database` холболтын мөрөнд дээр үүсгэсэн нууц үгээ оруулна. `secret_key`-г шинэ санамсаргүй утгаар солино. `admin_listen_address`-ийг нэг серверийн тохиргоонд `127.0.0.1` болгоно. Оролцогчдод зөвхөн ContestWebServer-ийн хаягийг нээнэ; PostgreSQL болон CMS-ийн дотоод service port-уудыг LAN руу нээхгүй. Жишээ config-ийн default password, key-г бодит тэмцээнд хэрэглэж болохгүй.

Sample-ийн `core_services` дотор 16 Worker тохируулсан байдаг. Эхний нэг серверийн туршилтад `Worker` жагсаалтыг жишээлбэл `[["localhost", 26000]]` болгон цөөлнө. Мөн ашиглахгүй PrintingService, ProxyService зэрэг нэмэлт service-үүдийг өөрийн зохион байгуулалтад тааруулна. `cmsInitDB`-г зөвхөн шинэ, хоосон database дээр нэг удаа ажиллуулна.

Нууцтай `cms.conf` болон `cms.ranking.conf`-ийг GitHub руу push хийхгүй. `config/*.sample` нь зөвхөн жишээ; CMS-ийн ажиллах тохиргоо Ubuntu дахь `/usr/local/etc/`-д байна. DB, submission болон log нь Git repo дотор хадгалагдахгүй. Тэдгээрийн backup-ийг тусад нь хийнэ.

```bash
source ~/cms_venv/bin/activate
cmsInitDB
cmsAddAdmin admin
```

`cmsAddAdmin`-ийн хэвлэсэн түр password-ийг хадгалж, админ хуудсанд нэвтэрсний дараа солино.

## 4. Тэмцээн үүсгэж ажиллуулах

AdminWebServer-ээр contest, task, user үүсгэнэ. Дараа нь CMS-ийн service-үүдийг нэг Ubuntu сервер дээр:

```bash
source ~/cms_venv/bin/activate
cmsLogService
```

Өөр терминалд:

```bash
source ~/cms_venv/bin/activate
cmsResourceService -a
```

`cmsResourceService -a` нь аль contest-ийг ачаалахыг асууна. Ubuntu серверийн браузераас админ хуудас `http://localhost:8889/`, оролцогчийн хуудас default-аар `http://<SERVER_LAN_IP>:8888/`. Админ хуудсыг зөвхөн журийн машинаас хандах шаардлагатай бол VPN/SSH tunnel эсвэл тусдаа admin сүлжээ ашиглана. Тэмцээний өмнө нэг Windows машинаас `.cpp` илгээж, компайл, үнэлгээ, оноо, дахин асаалт, backup сэргээхийг туршина. Интернэт салгасан үед бүх үйлчилгээ ажиллаж байгааг давтан шалгана.

Дэлгэрэнгүй эх сурвалж: [`docs/Installation.rst`](docs/Installation.rst), [`docs/Running CMS.rst`](docs/Running%20CMS.rst), [`docs/Introduction.rst`](docs/Introduction.rst). Олон оролцогчтой бодит тэмцээнд worker-ийг тусдаа машинд байрлуулах болон nginx/HTTPS тохируулахыг CMS-ийн баримт бичиг зөвлөдөг.
