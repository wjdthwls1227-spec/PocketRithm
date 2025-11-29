import HomeNav from '@/components/navbar/HomeNav'

export default function PrivacyPage() {
  return (
    <>
      <HomeNav />
      <main className="min-h-screen" style={{ background: '#F7F7F8' }}>
        <div className="max-w-4xl mx-auto px-5 py-16">
          <div className="card-toss p-10">
            <h1 className="text-3xl font-semibold mb-8" style={{ color: '#111111', letterSpacing: '-0.5px' }}>
              개인정보처리방침
            </h1>
            
            <div className="space-y-6 text-sm" style={{ color: '#565656', lineHeight: '1.8' }}>
              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>제1조 (개인정보의 처리목적)</h2>
                <p>
                  포켓리즘(PocketRism, 이하 "회사")은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>회원 가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지 목적</li>
                  <li>서비스 제공: 지출 기록, 소비 패턴 분석, 회고 작성 및 관리 등 서비스 제공</li>
                  <li>서비스 개선: 신규 서비스 개발 및 맞춤 서비스 제공, 서비스 이용 통계 분석</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>제2조 (개인정보의 처리 및 보유기간)</h2>
                <p>
                  1. 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.<br />
                  2. 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:<br />
                  &nbsp;&nbsp;- 회원 가입 및 관리: 회원 탈퇴 시까지 (단, 관계 법령 위반에 따른 수사·조사 등이 진행중인 경우에는 해당 수사·조사 종료 시까지)<br />
                  &nbsp;&nbsp;- 서비스 이용 기록: 회원 탈퇴 시까지
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>제3조 (처리하는 개인정보의 항목)</h2>
                <p>
                  회사는 다음의 개인정보 항목을 처리하고 있습니다:<br />
                  <br />
                  <strong>필수항목:</strong> 이메일, 비밀번호, 이름<br />
                  <strong>자동 수집 항목:</strong> IP주소, 쿠키, 서비스 이용 기록, 접속 로그<br />
                  <strong>선택항목:</strong> 프로필 이미지, 월 예산, 알림 설정 등
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>제4조 (개인정보의 제3자 제공)</h2>
                <p>
                  회사는 정보주체의 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>제5조 (개인정보처리의 위탁)</h2>
                <p>
                  1. 회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:<br />
                  &nbsp;&nbsp;- Supabase: 데이터베이스 및 인증 서비스 제공<br />
                  &nbsp;&nbsp;- 기타 클라우드 서비스 제공업체: 서비스 인프라 제공<br />
                  2. 회사는 위탁계약 체결 시 개인정보 보호법 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>제6조 (정보주체의 권리·의무 및 행사방법)</h2>
                <p>
                  1. 정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:<br />
                  &nbsp;&nbsp;- 개인정보 처리정지 요구권<br />
                  &nbsp;&nbsp;- 개인정보 열람요구권<br />
                  &nbsp;&nbsp;- 개인정보 정정·삭제요구권<br />
                  &nbsp;&nbsp;- 개인정보 처리정지 요구권<br />
                  2. 제1항에 따른 권리 행사는 회사에 대해 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.<br />
                  3. 정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 회사는 정정 또는 삭제를 완료할 때까지 당해 개인정보를 이용하거나 제공하지 않습니다.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>제7조 (개인정보의 파기)</h2>
                <p>
                  1. 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.<br />
                  2. 개인정보 파기의 절차 및 방법은 다음과 같습니다:<br />
                  &nbsp;&nbsp;- 파기절차: 회사는 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.<br />
                  &nbsp;&nbsp;- 파기방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>제8조 (개인정보 보호책임자)</h2>
                <p>
                  회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.<br />
                  <br />
                  <strong>개인정보 보호책임자</strong><br />
                  이메일: wjdthwls12@naver.com<br />
                  <br />
                  정보주체께서는 회사의 서비스를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보 보호책임자에게 문의하실 수 있습니다.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>제9조 (개인정보의 안전성 확보조치)</h2>
                <p>
                  회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다:<br />
                  1. 관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등<br />
                  2. 기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치<br />
                  3. 물리적 조치: 전산실, 자료보관실 등의 접근통제
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>제10조 (개인정보 처리방침 변경)</h2>
                <p>
                  이 개인정보처리방침은 2025년 1월 1일부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
                </p>
              </section>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs" style={{ color: '#8E8E93' }}>
                  본 방침은 2025년 1월 1일부터 시행됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

