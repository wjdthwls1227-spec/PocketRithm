import HomeNav from '@/components/navbar/HomeNav'

export default function TermsPage() {
  return (
    <>
      <HomeNav />
      <main className="min-h-screen" style={{ background: '#F7F7F8' }}>
        <div className="max-w-4xl mx-auto px-5 py-16">
          <div className="card-toss p-10">
            <h1 className="text-3xl font-semibold mb-8" style={{ color: '#111111', letterSpacing: '-0.5px' }}>
              이용약관
            </h1>
            
            <div className="space-y-6 text-sm" style={{ color: '#565656', lineHeight: '1.8' }}>
              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>제1조 (목적)</h2>
                <p>
                  본 약관은 포켓리즘(PocketRism, 이하 &quot;회사&quot;)이 제공하는 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>제2조 (정의)</h2>
                <p>
                  1. &quot;서비스&quot;란 회사가 제공하는 가계부 회고 및 소비 습관 개선을 위한 모든 서비스를 의미합니다.<br />
                  2. &quot;이용자&quot;란 본 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 의미합니다.<br />
                  3. &quot;회원&quot;이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며, 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 의미합니다.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>제3조 (약관의 게시와 개정)</h2>
                <p>
                  1. 회사는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.<br />
                  2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.<br />
                  3. 회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 서비스 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>제4조 (서비스의 제공 및 변경)</h2>
                <p>
                  1. 회사는 다음과 같은 서비스를 제공합니다:<br />
                  &nbsp;&nbsp;- 지출 기록 및 관리 서비스<br />
                  &nbsp;&nbsp;- 소비 패턴 분석 서비스<br />
                  &nbsp;&nbsp;- 회고 작성 및 관리 서비스<br />
                  &nbsp;&nbsp;- 기타 회사가 추가 개발하거나 제휴계약 등을 통해 제공하는 일체의 서비스<br />
                  2. 회사는 필요한 경우 서비스의 내용을 변경할 수 있으며, 변경 시에는 사전에 공지합니다.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>제5조 (서비스의 중단)</h2>
                <p>
                  1. 회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.<br />
                  2. 회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상합니다. 단, 회사가 고의 또는 과실이 없음을 입증하는 경우에는 그러하지 아니합니다.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>제6조 (회원가입)</h2>
                <p>
                  1. 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.<br />
                  2. 회사는 제1항과 같이 회원가입을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다:<br />
                  &nbsp;&nbsp;- 가입신청자가 이전에 회원자격을 상실한 적이 있는 경우<br />
                  &nbsp;&nbsp;- 등록 내용에 허위, 기재누락, 오기가 있는 경우<br />
                  &nbsp;&nbsp;- 기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>제7조 (회원 탈퇴 및 자격 상실 등)</h2>
                <p>
                  1. 회원은 회사에 언제든지 탈퇴를 요청할 수 있으며 회사는 즉시 회원탈퇴를 처리합니다.<br />
                  2. 회원이 다음 각 호의 사유에 해당하는 경우, 회사는 회원자격을 제한 및 정지시킬 수 있습니다:<br />
                  &nbsp;&nbsp;- 가입 신청 시에 허위 내용을 등록한 경우<br />
                  &nbsp;&nbsp;- 다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우<br />
                  &nbsp;&nbsp;- 서비스를 이용하여 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>제8조 (개인정보보호)</h2>
                <p>
                  1. 회사는 이용자의 개인정보 수집시 서비스제공을 위하여 필요한 범위에서 최소한의 개인정보를 수집합니다.<br />
                  2. 회사는 회원가입시 구매계약이 필요없는 경우 회원가입시에 요구하는 정보를 수집합니다.<br />
                  3. 회사는 이용자의 개인정보를 수집·이용하는 때에는 당해 이용자에게 그 목적을 고지하고 동의를 받습니다.<br />
                  4. 회사는 수집된 개인정보를 목적외의 용도로 이용할 수 없으며, 새로운 이용목적이 발생한 경우 또는 제3자에게 제공하는 경우에는 이용·제공단계에서 당해 이용자에게 그 목적을 고지하고 동의를 받습니다.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>제9조 (면책조항)</h2>
                <p>
                  1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.<br />
                  2. 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.<br />
                  3. 회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#111111' }}>제10조 (준거법 및 관할법원)</h2>
                <p>
                  1. 회사와 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은 제소 당시의 이용자의 주소에 의하고, 주소가 없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다.<br />
                  2. 회사와 이용자 간에 제기된 전자상거래 소송에는 한국법을 적용합니다.
                </p>
              </section>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs" style={{ color: '#8E8E93' }}>
                  본 약관은 2025년 1월 1일부터 시행됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

