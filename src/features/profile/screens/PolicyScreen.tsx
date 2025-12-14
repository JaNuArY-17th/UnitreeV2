import ScreenHeader from '@/shared/components/ScreenHeader';
import { useNavigation } from '@react-navigation/native';
import { colors, FONT_WEIGHTS, getFontFamily, spacing, typography } from '@/shared/themes';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View, StatusBar } from 'react-native';
import Text from '@/shared/components/base/Text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStatusBarEffect } from '../../../shared/utils/StatusBarManager';

export function PolicySecurityRiskScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation('profile');
  const handleBackPress = () => {
    navigation.goBack();
  };

  useStatusBarEffect('transparent', 'dark-content', true);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <ScreenHeader title={t('policy.title')} onBackPress={handleBackPress} showBack />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.paragraph}>
          Điều khoản và Điều kiện chung về bảo vệ và xử lý dữ liệu cá nhân này (“Điều Khoản Chung”)
          nêu rõ cách thức mà Công ty TNHH ENSOGO thu thập, xử lý và bảo vệ dữ liệu cá nhân của Chủ
          thể dữ liệu.
        </Text>

        <Text style={styles.title}>Điều 1. Giải thích từ ngữ</Text>
        <Text style={styles.paragraph}>
          Các thuật ngữ được sử dụng trong Điều Khoản Chung này được giải thích như sau (trừ khi có
          giải thích khác theo quy định của pháp luật):
        </Text>
        <Text style={styles.subTitle}>1.1 “Dữ liệu cá nhân”</Text>
        <Text style={styles.paragraph}>
          là thông tin dưới dạng ký hiệu, chữ viết, chữ số, hình ảnh, âm thanh hoặc dạng tương tự
          trên môi trường điện tử gắn liền với một con người cụ thể hoặc giúp xác định một con người
          cụ thể. Dữ liệu cá nhân bao gồm dữ liệu cá nhân cơ bản và dữ liệu cá nhân nhạy cảm.
        </Text>
        <Text style={styles.subTitle}>1.2 “Dữ liệu cá nhân cơ bản” bao gồm:</Text>
        <Text style={styles.listItem}>a) Họ, chữ đệm và tên khai sinh, tên gọi khác (nếu có);</Text>
        <Text style={styles.listItem}>b) Ngày, tháng, năm sinh; ngày, tháng, năm chết hoặc mất tích;</Text>
        <Text style={styles.listItem}>c) Giới tính;</Text>
        <Text style={styles.listItem}>d) Nơi sinh, nơi đăng ký khai sinh, nơi thường trú, nơi tạm trú, nơi ở hiện tại, quê quán, địa chỉ liên hệ;</Text>
        <Text style={styles.listItem}>e) Quốc tịch;</Text>
        <Text style={styles.listItem}>f) Hình ảnh của cá nhân;</Text>
        <Text style={styles.listItem}>g) Số điện thoại, số chứng minh nhân dân, số định danh cá nhân, số hộ chiếu, số giấy phép lái xe, số biển số xe, số mã số thuế cá nhân, số bảo hiểm xã hội, số thẻ bảo hiểm y tế;</Text>
        <Text style={styles.listItem}>h) Tình trạng hôn nhân;</Text>
        <Text style={styles.listItem}>i) Thông tin về mối quan hệ gia đình (cha mẹ, con cái);</Text>
        <Text style={styles.listItem}>j) Thông tin về tài khoản số của cá nhân; dữ liệu cá nhân phản ánh hoạt động, lịch sử hoạt động trên không gian mạng;</Text>
        <Text style={styles.listItem}>k) Các thông tin khác gắn liền với một con người cụ thể hoặc giúp xác định một con người cụ thể mà không thuộc trường hợp dữ liệu cá nhân nhạy cảm.</Text>

        <Text style={styles.subTitle}>1.3. “Dữ liệu cá nhân nhạy cảm”</Text>
        <Text style={styles.paragraph}>
          là dữ liệu cá nhân gắn liền với quyền riêng tư của cá nhân mà khi bị xâm phạm sẽ gây ảnh
          hưởng trực tiếp tới quyền và lợi ích hợp pháp của cá nhân gồm:
        </Text>
        <Text style={styles.listItem}>a) Quan điểm chính trị, quan điểm tôn giáo;</Text>
        <Text style={styles.listItem}>b) Tình trạng sức khỏe và đời tư được ghi trong hồ sơ bệnh án, không bao gồm thông tin về nhóm máu;</Text>
        <Text style={styles.listItem}>c) Thông tin liên quan đến nguồn gốc chủng tộc, nguồn gốc dân tộc;</Text>
        <Text style={styles.listItem}>d) Thông tin về đặc điểm di truyền được thừa hưởng hoặc có được của cá nhân;</Text>
        <Text style={styles.listItem}>e) Thông tin về thuộc tính vật lý, đặc điểm sinh học riêng của cá nhân;</Text>
        <Text style={styles.listItem}>f) Thông tin về đời sống tình dục, xu hướng tình dục của cá nhân;</Text>
        <Text style={styles.listItem}>g) Dữ liệu về tội phạm, hành vi phạm tội được thu thập, lưu trữ bởi các cơ quan thực thi pháp luật;</Text>
        <Text style={styles.listItem}>h) Thông tin khách hàng của tổ chức tín dụng, chi nhánh ngân hàng nước ngoài, tổ chức cung ứng dịch vụ trung gian thanh toán, các tổ chức được phép khác, gồm: thông tin định danh khách hàng theo quy định của pháp luật, thông tin về tài khoản, thông tin về tiền gửi, thông tin về tài sản gửi, thông tin về giao dịch, thông tin về tổ chức, cá nhân là bên bảo đảm tại tổ chức tín dụng, chi nhánh ngân hàng, tổ chức cung ứng dịch vụ trung gian thanh toán;</Text>
        <Text style={styles.listItem}>i) Dữ liệu về vị trí của cá nhân được xác định qua dịch vụ định vị;</Text>
        <Text style={styles.listItem}>j) Dữ liệu cá nhân khác được pháp luật quy định là đặc thù và cần có biện pháp bảo mật cần thiết.</Text>

        <Text style={styles.subTitle}>1.4 “Xử lý dữ liệu cá nhân”</Text>
        <Text style={styles.paragraph}>là một hoặc nhiều hoạt động tác động tới dữ liệu cá nhân, như: thu thập, ghi, phân tích, xác nhận, lưu trữ, chỉnh sửa, công khai, kết hợp, truy cập, truy xuất, thu hồi, mã hóa, giải mã, sao chép, chia sẻ, truyền đưa, cung cấp, chuyển giao, xóa, hủy dữ liệu cá nhân hoặc các hành động khác có liên quan.</Text>
        <Text style={styles.subTitle}>1.5. “Chủ thể dữ liệu”</Text>
        <Text style={styles.paragraph}>là các cá nhân được dữ liệu cá nhân phản ánh mà dữ liệu cá nhân của họ được chia sẻ cho ESG, bao gồm nhưng không giới hạn các cá nhân là khách hàng của ESG; người dùng trên các nền tảng số của ESG; cá nhân thuộc các tổ chức có quan hệ pháp lý với ESG; cá nhân là/thuộc bên cung cấp sản phẩm, dịch vụ cho ESG; cộng tác viên, ứng viên tiềm năng, người lao động; hoặc bất kỳ cá nhân nào khác có liên quan hoặc phát sinh quan hệ sử dụng, cung cấp sản phẩm, dịch vụ, quan hệ lao động hoặc quan hệ pháp lý khác với ESG.</Text>
        <Text style={styles.subTitle}>1.6. “Khách hàng”</Text>
        <Text style={styles.paragraph}>là các cá nhân, tổ chức tiếp cận, tìm hiểu, đăng ký, sử dụng, thiết lập quan hệ hoặc có liên quan đối với các sản phẩm, dịch vụ do ESG cung cấp.</Text>
        <Text style={styles.subTitle}>1.7. “Bên cung cấp dữ liệu cá nhân”</Text>
        <Text style={styles.paragraph}>là Chủ thể dữ liệu hoặc cá nhân, tổ chức thay mặt hoặc được sự đồng ý của cá nhân là Chủ thể dữ liệu để cung cấp và cho phép xử lý dữ liệu cá nhân của cá nhân đó cho ESG.</Text>
        <Text style={styles.subTitle}>1.8 “Công ty” hoặc “ESG”</Text>
        <Text style={styles.paragraph}>là Công ty TNHH ENSOGO, bao gồm trụ sở, chi nhánh, văn phòng đại diện, phòng giao dịch của công ty (nếu có).</Text>
        <Text style={styles.subTitle}>1.9. “Bên thứ ba”</Text>
        <Text style={styles.paragraph}>là tổ chức, cá nhân ngoài ESG, Khách hàng và Chủ thể dữ liệu.</Text>
        <Text style={styles.paragraph}>Để làm rõ, các từ ngữ nào chưa được giải thích tại Điều Khoản Chung sẽ được giải thích theo quy định của pháp luật Việt Nam.</Text>

        <Text style={styles.title}>Điều 2. Những nguyên tắc chung</Text>
        <Text style={styles.paragraph}>2.1. ESG đề cao và tôn trọng quyền riêng tư, bảo mật và an toàn Dữ liệu cá nhân. Đồng thời, ESG luôn nỗ lực bảo vệ Dữ liệu cá nhân, quyền riêng tư của Chủ thể dữ liệu và tuân thủ pháp luật thông qua những biện pháp bảo vệ Dữ liệu cá nhân nhằm đáp ứng và phù hợp với quy định được ban hành;</Text>
        <Text style={styles.paragraph}>2.2. ESG chỉ thu thập, xử lý Dữ liệu cá nhân phù hợp với quy định của pháp luật và trong phạm vi (các) văn bản, thỏa thuận được giao kết giữa ESG và Khách hàng và/hoặc (các) bên có liên quan;</Text>
        <Text style={styles.paragraph}>2.3. Phụ thuộc vào vai trò của ESG trong từng tình huống cụ thể là (i) Bên Kiểm soát dữ liệu cá nhân; (ii) Bên Xử lý dữ liệu cá nhân; hoặc (iii) Bên Kiểm soát và xử lý dữ liệu cá nhân, ESG sẽ thực hiện các quyền hạn, trách nhiệm cũng như các nguyên tắc xử lý Dữ liệu cá nhân tương ứng theo quy định của pháp luật hiện hành;</Text>
        <Text style={styles.paragraph}>2.4. Tất cả các quyền và nghĩa vụ của ESG, Chủ thể dữ liệu, Bên cung cấp dữ liệu cá nhân tại Điều Khoản Chung này sẽ không thay thế, chấm dứt hoặc thay đổi mà sẽ đồng thời là các quyền, nghĩa vụ mà ESG, Chủ thể dữ liệu, Bên cung cấp dữ liệu cá nhân đang có ở bất kỳ văn bản nào và không một điều khoản nào trong Điều Khoản Chung này hàm ý hạn chế hoặc xóa bỏ bất kỳ quyền, nghĩa vụ nào trong số các quyền, nghĩa vụ của các bên đã được xác lập, trừ trường hợp có thỏa thuận khác bằng văn bản;</Text>
        <Text style={styles.paragraph}>2.5. Chủ thể dữ liệu/Bên cung cấp dữ liệu cá nhân hiểu và đồng ý rằng, Dữ liệu cá nhân (bao gồm cả Dữ liệu cá nhân cơ bản và Dữ liệu cá nhân nhạy cảm) được cung cấp cho ESG sẽ không giới hạn trong phạm vi các dữ liệu cá nhân sẽ được cung cấp mà còn bao gồm các dữ liệu cá nhân đã được cung cấp cho ESG. Việc Chủ thể dữ liệu/Bên cung cấp dữ liệu cá nhân tiếp tục sử dụng các dịch vụ, sản phẩm của ESG hoặc tiếp tục duy trì các giao dịch, thỏa thuận đã thiết lập với ESG sau thời điểm chấp thuận Điều Khoản Chung này chính là sự đồng ý rõ ràng, tự nguyện và khẳng định của Chủ thể dữ liệu/Bên cung cấp dữ liệu cá nhân cho phép ESG xử lý Dữ liệu cá nhân (bao gồm cả Dữ liệu cá nhân cơ bản và Dữ liệu cá nhân nhạy cảm) trong suốt quá trình tiếp nhận và xử lý Dữ liệu cá nhân, bắt đầu từ khi ESG tiếp nhận được thông tin cho đến khi có yêu cầu chấm dứt việc xử lý dữ liệu từ Chủ thể dữ liệu/Bên cung cấp dữ liệu hoặc theo quy định của pháp luật;</Text>
        <Text style={styles.paragraph}>2.6. Khi cung cấp Dữ liệu cá nhân của một bên khác (bao gồm nhưng không giới hạn ở Dữ liệu cá nhân của người đại diện giao dịch của tổ chức, người phụ thuộc, người có liên quan theo quy định pháp luật, người giám hộ, bạn bè, bên thụ hưởng, người được ủy quyền, đối tác, người liên hệ trong các trường hợp khẩn cấp hoặc cá nhân khác) cho ESG, Bên cung cấp dữ liệu cá nhân cam đoan, bảo đảm và chịu trách nhiệm rằng Bên cung cấp dữ liệu cá nhân đã cung cấp thông tin đầy đủ và có được sự đồng ý hợp pháp của Chủ thể dữ liệu cho phép ESG thu thập, xử lý các Dữ liệu cá nhân theo Điều Khoản Chung này. Bên cung cấp dữ liệu cá nhân đồng ý rằng ESG không có trách nhiệm phải thẩm định về tính hợp pháp, hợp lệ của sự đồng ý trên và việc lưu trữ bằng chứng chứng minh thuộc trách nhiệm của Bên cung cấp dữ liệu cá nhân. Bên cung cấp dữ liệu cá nhân phải cung cấp bằng chứng chứng minh về sự đồng ý của Chủ thể dữ liệu trên trong trường ESG có yêu cầu. ESG được miễn trừ trách nhiệm và được yêu cầu bồi thường các thiệt hại, chi phí liên quan khi Bên cung cấp dữ liệu cá nhân không thực hiện đúng nội dung quy định tại Mục này.</Text>

        <Text style={styles.title}>Điều 3. Các nội dung về xử lý dữ liệu cá nhân</Text>
        <Text style={styles.subTitle}>3.1. Thu thập dữ liệu cá nhân</Text>
        <Text style={styles.paragraph}>3.1.1. Để thực hiện các mục đích tại Điều 3.2 dưới đây, ESG cần và/hoặc được yêu cầu phải thu thập Dữ liệu cá nhân của Chủ thể dữ liệu.</Text>
        <Text style={styles.paragraph}>3.1.2. Cách thức và phương thức ESG thu thập Dữ liệu cá nhân</Text>
        <Text style={styles.paragraph}>ESG có thể thu thập trực tiếp hoặc gián tiếp Dữ liệu cá nhân từ một hoặc một số các nguồn như được liệt kê dưới đây, bao gồm nhưng không giới hạn:</Text>
        <Text style={styles.listItem}>a) Từ việc gặp gỡ trực tiếp Bên cung cấp dữ liệu cá nhân:  thu thập trong quá trình tiếp xúc, làm việc, cung cấp/sử dụng dịch vụ, gặp mặt trực tiếp Bên cung cấp dữ liệu cá nhân và được Bên cung cấp dữ liệu cá nhân cung cấp thông tin;</Text>
        <Text style={styles.listItem}>b) Từ các trao đổi, liên lạc với Bên cung cấp dữ liệu cá nhân khi phát sinh liên hệ giữa Bên cung cấp dữ liệu cá nhân với ESG, như qua email, Tổng đài của ESG (Contact Center), liên lạc điện tử hoặc bất kỳ phương tiện nào khác (bao gồm nhưng không giới hạn cả các cuộc khảo sát, điều tra mà ESG tiến hành hoặc có được);</Text>
        <Text style={styles.listItem}>c) Từ các trang tin điện tử của ESG khi Bên cung cấp dữ liệu cá nhân có sự truy cập, khai báo Dữ liệu cá nhân;</Text>
        <Text style={styles.listItem}>d) Từ ứng dụng di động khi Bên cung cấp dữ liệu cá nhân có sự tải xuống, sử dụng hoặc khai báo Dữ liệu cá nhân trên ứng dụng dành cho thiết bị di động của ESG;</Text>
        <Text style={styles.listItem}>e) Từ các tương tác hoặc các công nghệ thu thập dữ liệu tự động: ESG có thể thu thập Dữ liệu cá nhân của Chủ thể dữ liệu được ghi tự động từ kết nối của Bên cung cấp dữ liệu cá nhân hoặc các bên có liên quan như cookies, plug-in, trình tự kết nối mạng xã hội của bên thứ ba hoặc bất kỳ công nghệ nào có khả năng theo dõi, thu nhận Dữ liệu cá nhân trên các thiết bị hoặc trang tin điện tử đó (như: facebook, tiktok, instagram…);</Text>
        <Text style={styles.listItem}>f) Từ Cơ quan nhà nước có thẩm quyền hoặc các cơ quan chức năng, có thẩm quyền khác tại Việt Nam;</Text>
        <Text style={styles.listItem}>g) Từ các nguồn được công khai như danh bạ điện thoại, thông tin quảng cáo/tờ rơi, các thông tin được công khai trên mạng….</Text>
        <Text style={styles.listItem}>h) Từ những nguồn khác mà Chủ thể dữ liệu đồng ý việc chia sẻ/cung cấp Dữ liệu cá nhân, hoặc những nguồn mà việc thu thập được pháp luật yêu cầu hoặc cho phép.</Text>

        <Text style={styles.subTitle}>3.2. Mục đích xử lý Dữ liệu cá nhân</Text>
        <Text style={styles.paragraph}>3.2.1. ESG có thể xử lý Dữ liệu cá nhân cho một hoặc nhiều mục đích sau đây:</Text>
        <Text style={styles.subTitle}>3.2.1.1. Mục đích chung:</Text>
        <Text style={styles.listItem}>a) Rà soát tính chính xác, đầy đủ của các Dữ liệu cá nhân được cung cấp; xác định hoặc xác thực danh tính Chủ thể dữ liệu và thực hiện quy trình xác thực Chủ thể dữ liệu;</Text>
        <Text style={styles.listItem}>b) Để xác lập quan hệ giữa ESG với Chủ thể dữ liệu/Bên cung cấp dữ liệu cá nhân/Bên thứ ba có liên quan;</Text>
        <Text style={styles.listItem}>c) Để phục vụ các mục đích khác có liên quan đến hoạt động kinh doanh của ESG mà ESG cho là phù hợp tại từng thời điểm;</Text>
        <Text style={styles.listItem}>d) Bảo vệ lợi ích hợp pháp của ESG và tuân thủ các quy định pháp luật liên quan, bao gồm nhưng không giới hạn việc để thu các khoản phí, lệ phí và/hoặc để thu hồi bất kỳ khoản nợ nào, hay xử lý các thủ tục khiếu kiện, khiếu nại hay theo bất kỳ thỏa thuận nào giữa Chủ thể dữ liệu/ Bên cung cấp dữ liệu cá nhân và ESG;</Text>
        <Text style={styles.listItem}>e) Để đánh giá bất kỳ đề xuất nào liên quan đến quyền, lợi ích hoặc nghĩa vụ theo (những) văn bản, thỏa thuận giữa Chủ thể dữ liệu/Bên cung cấp dữ liệu cá nhân với ESG;</Text>
        <Text style={styles.listItem}>f) Cung cấp cho các bên cung cấp dịch vụ/đối tác của ESG để thực hiện giao dịch cho Chủ thể dữ liệu/ Bên cung cấp dữ liệu cá nhân và/hoặc ESG;</Text>
        <Text style={styles.listItem}>g) Ngăn chặn hoặc giảm thiểu mối đe doạ đối với tính mạng, sức khỏe của người khác và lợi ích công cộng;</Text>
        <Text style={styles.listItem}>h) Để đánh giá rủi ro, phân tích xu hướng, thống kê, lên kế hoạch, bao gồm và không giới hạn việc phân tích xử lý dữ liệu về thống kê, giao dịch, tín dụng và phòng chống rửa tiền, tài trợ khủng bố, tài trợ vũ khí hủy diệt hàng loạt;</Text>
        <Text style={styles.listItem}>i) Để phát hiện, ngăn chặn và điều tra tội phạm, tấn công hoặc các hành vi vi phạm pháp luật (bao gồm cả gian lận, hối lộ, tham nhũng hoặc trốn thuế);</Text>
        <Text style={styles.listItem}>j) Để thực hiện các giao dịch như chuyển giao, định đoạt, tổ chức lại doanh nghiệp hoặc mua bán, trao đổi đối với hoạt động, tài sản của ESG;</Text>
        <Text style={styles.listItem}>k) Để đáp ứng, tuân thủ các chính sách nội bộ của ESG, các thủ tục và bất kỳ quy tắc, quy định, hướng dẫn, chỉ thị hoặc yêu cầu được ban hành bởi Cơ quan nhà nước có thẩm quyền theo quy định pháp luật;</Text>

        <Text style={styles.paragraph}>3.2.1.2. Ngoài Mục đích chung tại Điều 3.2.1.1 nêu trên thì ESG còn có thể xử lý Dữ liệu cá nhân cho một hoặc nhiều mục đích tương ứng đối với từng đối tượng sau:</Text>
        <Text style={styles.subTitle}>A) Đối với Khách hàng</Text>
        <Text style={styles.listItem}>a) Thẩm định hồ sơ pháp lý, khả năng tài chính và điều kiện đáp ứng của Khách hàng đối với bất kỳ nghiệp vụ, sản phẩm và dịch vụ nào do ESG đề xuất hoặc cung cấp;</Text>
        <Text style={styles.listItem}>b) Cung cấp các nghiệp vụ, sản phẩm, dịch vụ do ESG triển khai (bao gồm nhưng không giới hạn các sản phẩm mà bên thứ ba phối hợp với ESG thực hiện theo quy định của pháp luật);</Text>
        <Text style={styles.listItem}>c) Quảng bá, thông tin về các sản phẩm, dịch vụ, chương trình khuyến mại, nghiên cứu, khảo sát, tin tức, thông tin cập nhật, các sự kiện, cuộc thi có thưởng, trao các phần thưởng có liên quan, các hoạt động truyền thông, giới thiệu có liên quan về các dịch vụ, sản phẩm của ESG và các dịch vụ của đối tác khác có hợp tác với ESG;</Text>
        <Text style={styles.listItem}>d) Liên hệ nhằm trao đổi thông tin, cung cấp các văn bản hoặc các tài liệu khác có liên quan đến giao dịch và việc sử dụng các sản phẩm, dịch vụ tại ESG;</Text>
        <Text style={styles.listItem}>e) Thông báo các thông tin về nghĩa vụ, quyền lợi, thay đổi các tính năng, cải tiến và nâng cao tiện ích, chất lượng của sản phẩm, dịch vụ;</Text>
        <Text style={styles.listItem}>f) Lập các báo cáo tài chính, báo cáo hoạt động hoặc các loại báo cáo liên quan khác theo quy định pháp luật;</Text>
        <Text style={styles.listItem}>g) Thực hiện nghiên cứu thị trường, khảo sát và phân tích dữ liệu liên quan đến bất kỳ các sản phẩm, dịch vụ nào do ESG cung cấp (dù được thực hiện bởi ESG hay một bên thứ ba khác mà ESG hợp tác) mà có thể liên quan đến Khách hàng/Chủ thể dữ liệu.</Text>
        <Text style={styles.subTitle}>B) Đối với bên cung cấp sản phẩm, dịch vụ, đối tác cho thuê, thuê tài sản, hợp tác với ESG</Text>
        <Text style={styles.listItem}>a) Để giao kết và thực hiện các mục đích theo các văn bản, thỏa thuận có liên quan;</Text>
        <Text style={styles.listItem}>b) Liên hệ làm việc, trao đổi, xác nhận thông tin trong quá trình thực hiện các công việc/dịch vụ giữa Bên cung cấp dữ liệu cá nhân với ESG.</Text>
        <Text style={styles.subTitle}>C) Đối với ứng viên tiềm năng, cộng tác viên, người lao động</Text>
        <Text style={styles.listItem}>a) Rà soát điều kiện ứng viên, cộng tác viên; đánh giá hồ sơ, tài liệu, chứng từ với mục đích thẩm định, đánh giá tư cách ứng viên, cộng tác viên, đăng ký hồ sơ ứng viên, cộng tác viên và phục vụ quá trình tuyển dụng, ký kết hợp đồng dịch vụ;</Text>
        <Text style={styles.listItem}>b) Ký kết và quản lý hợp đồng, thỏa thuận việc làm, dịch vụ với ứng viên, cộng tác viên, người lao động;</Text>
        <Text style={styles.listItem}>c) Đào tạo, kiểm tra, đánh giá chất lượng công việc và việc tuân thủ các nghĩa vụ tại hợp đồng, thỏa thuận, cam kết với ESG;</Text>
        <Text style={styles.listItem}>d) Quản lý hồ sơ nhân sự và thực hiện các thủ tục theo quy định của pháp luật với các cơ quan chức năng, cơ quan có thẩm quyền như cơ quan lao động, bảo hiểm, thuế,....</Text>
        <Text style={styles.listItem}>e) Thực hiện các hoạt động, công việc cần thiết từ các thỏa thuận, hợp đồng được ký kết với các bên thứ ba tùy theo mục đích, nhu cầu phát sinh tại từng thời điểm như dịch vụ đào tạo, bảo hiểm sức khỏe, khám chữa bệnh, vận tải, du lịch, tổ chức sự kiện,…;</Text>
        <Text style={styles.listItem}>f) Thực hiện các mục đích khác liên quan đến việc phát triển, quản trị nguồn nhân lực.</Text>

        <Text style={styles.paragraph}>3.2.2. ESG sẽ yêu cầu sự cho phép từ Chủ thể dữ liệu trước khi sử dụng Dữ liệu cá nhân của họ cho mục đích khác ngoài các mục đích đã được nêu tại Điều Khoản Chung này.</Text>
        <Text style={styles.subTitle}>3.3. Xử lý Dữ liệu cá nhân trong một số trường hợp đặc biệt</Text>
        <Text style={styles.paragraph}>3.3.1. ESG sẽ có thể ghi âm, ghi hình và xử lý Dữ liệu cá nhân thu thập được từ camera quan sát (“CCTV”) tại các khu vực có lắp CCTV (bao gồm nhưng không giới hạn bởi khu vực văn phòng, khu vực ở hành lang, khu vực lối ra,..) phù hợp với các yêu cầu đảm bảo an ninh trong hoạt động của ESG và cho Khách hàng theo quy định của của pháp luật;</Text>
        <Text style={styles.paragraph}>3.3.2. ESG luôn tôn trọng và bảo vệ Dữ liệu cá nhân của trẻ em. Ngoài các biện pháp bảo vệ Dữ liệu cá nhân được quy định theo pháp luật, trước khi xử lý Dữ liệu cá nhân của trẻ em, ESG sẽ thực hiện xác minh tuổi của trẻ em và yêu cầu sự đồng ý của (i) trẻ em và/hoặc (ii) cha, mẹ hoặc người giám hộ của trẻ em theo quy định của pháp luật;</Text>
        <Text style={styles.paragraph}>3.3.3. Bên cạnh tuân thủ theo các quy định pháp luật có liên quan khác, đối với việc xử lý Dữ liệu cá nhân liên quan đến Dữ liệu cá nhân của người bị tuyên bố mất tích/người đã chết, ESG sẽ phải được sự đồng ý của một trong số những người có liên quan theo quy định của pháp luật hiện hành.</Text>
        <Text style={styles.subTitle}>3.4. Việc chuyển giao và tiết lộ Dữ liệu cá nhân</Text>
        <Text style={styles.paragraph}>3.4.1. ESG sẽ không bán, trao đổi, cho thuê (có thời hạn hoặc vô thời hạn) các thông tin cá nhân của Chủ thể dữ liệu mà không có sự chấp thuận của Chủ thể dữ liệu theo pháp luật hiện hành. Tuy nhiên, để thực hiện các mục đích và hoạt động xử lý Dữ liệu cá nhân tại Điều Khoản Chung này, Bên cung cấp dữ liệu cá nhân hiểu và đồng ý ESG có thể tiết lộ Dữ liệu cá nhân cho một hoặc các bên dưới đây:</Text>
        <Text style={styles.listItem}>a) Các đơn vị thành viên của ESG, bao gồm nhưng không giới hạn các công ty con, công ty thành viên, công ty liên doanh, công ty liên kết được ESG xác định trong từng thời kỳ;</Text>
        <Text style={styles.listItem}>b) Các nhân viên và bộ phận trong nội bộ ESG cho các mục đích được nêu trong Điều Khoản Chung này và các văn bản, thỏa thuận được ký kết giữa Khách hàng và ESG;</Text>
        <Text style={styles.listItem}>c) Các đơn vị tư vấn, luật sư, cố vấn, kế toán viên, kiểm toán viên của ESG hoặc Khách hàng;</Text>
        <Text style={styles.listItem}>d) Các cơ quan nhà nước có thẩm quyền tại Việt Nam hoặc bất kỳ cá nhân, cơ quan quản lý hoặc bên thứ ba mà ESG được phép hoặc bắt buộc phải tiết lộ theo quy định pháp luật của bất kỳ quốc gia, hoặc theo bất kỳ văn bản, thỏa thuận nào khác giữa bên thứ ba và ESG;</Text>
        <Text style={styles.listItem}>e) Các đối tác kinh doanh, nhà cung cấp phần thưởng, nhà cung cấp quà tặng, các bên đồng thương hiệu, bên tham gia hoặc phối hợp tổ chức chương trình khách hàng thân thiết, các nhà quảng cáo, tổ chức từ thiện hoặc tổ chức phi lợi nhuận, bất kỳ tổ chức nào có liên quan nhằm mục đích điều hành, triển khai hoạt động kinh doanh của ESG, bên triển khai vận hành hệ thống, ứng dụng hoặc thiết bị hay cung cấp cho Khách hàng bất kỳ sản phẩm, dịch vụ nào mà Khách hàng lựa chọn hoặc các mục đích được nêu trong Điều Khoản Chung này;</Text>
        <Text style={styles.listItem}>f) Bất kỳ cá nhân, tổ chức có liên quan đến việc thực thi hoặc duy trì bất kỳ quyền hoặc nghĩa vụ nào theo (các) thỏa thuận giữa Khách hàng/Bên cung cấp dữ liệu cá nhân với ESG;</Text>
        <Text style={styles.listItem}>g) Cha mẹ, vợ chồng, con, người thừa kế của Chủ thể dữ liệu trong trường hợp Chủ thể dữ liệu đã chết, bị tuyên bố mất tích;</Text>
        <Text style={styles.listItem}>h) Các bên thứ ba mà Khách hàng đồng ý hoặc ESG có cơ sở pháp lý để chia sẻ Dữ liệu cá nhân.</Text>
        <Text style={styles.paragraph}>3.4.2. ESG xem Dữ liệu cá nhân là riêng tư và bảo mật. Ngoài các bên đã nêu ở trên, ESG không tiết lộ Dữ liệu cá nhân cho bất kỳ bên nào khác, trừ các trường hợp:</Text>
        <Text style={styles.listItem}>a) Khi có sự đồng ý của Chủ thể dữ liệu;</Text>
        <Text style={styles.listItem}>b) Khi ESG được yêu cầu hoặc được phép tiết lộ theo quy định pháp luật; hoặc theo quyết định của cơ quan nhà nước có thẩm quyền;</Text>
        <Text style={styles.listItem}>c) Khi ESG chuyển giao quyền và nghĩa vụ theo (các) thỏa thuận giữa các bên có liên quan và ESG hoặc thực hiện theo quy định của pháp luật.</Text>
        <Text style={styles.subTitle}>3.5. Chuyển Dữ liệu cá nhân ra nước ngoài</Text>
        <Text style={styles.paragraph}>3.5.1. Nhằm thực hiện mục đích xử lý Dữ liệu cá nhân tại Điều Khoản Chung này, ESG có thể phải cung cấp/chia sẻ Dữ liệu cá nhân đến các bên thứ ba liên quan của ESG và các bên thứ ba này có thể tại Việt Nam hoặc bất cứ địa điểm nào khác nằm ngoài lãnh thổ Việt Nam.</Text>
        <Text style={styles.paragraph}>3.5.2. Khi thực hiện việc cung cấp/chia sẻ Dữ liệu cá nhân ra nước ngoài, ESG sẽ yêu cầu bên tiếp nhận đảm bảo rằng Dữ liệu cá nhân được chuyển giao cho họ sẽ bảo mật và an toàn. ESG và bên tiếp nhận đảm bảo tuân thủ các nghĩa vụ pháp lý và quy định liên quan đến việc bảo vệ Dữ liệu cá nhân.</Text>
        <Text style={styles.subTitle}>3.6. Cách thức xử lý Dữ liệu cá nhân</Text>
        <Text style={styles.paragraph}>Tùy thuộc vào mục đích xử lý Dữ liệu cá nhân, ESG hoặc bên xử lý dữ liệu của ESG hoặc bên thứ ba được phép xử lý dữ liệu cho ESG có thể áp dụng các cách thức xử lý phù hợp bao gồm nhưng không giới hạn ở các phương thức xử lý Dữ liệu cá nhân tự động, thủ công hoặc các phương thức khác phù hợp với quy định của pháp luật và của ESG từng thời kỳ.</Text>
        <Text style={styles.subTitle}>3.7. Thời gian xử lý Dữ liệu cá nhân</Text>
        <Text style={styles.paragraph}>Tùy thuộc từng hoạt động cụ thể, Dữ liệu cá nhân có thể được ESG xử lý sau khi được cung cấp, thu thập và kết thúc khi hoàn thành việc xử lý dữ liệu phù hợp với mục đích thực hiện hoặc cho đến khi Dữ liệu cá nhân đã được xóa theo quy định (tùy thời điểm nào đến sau).</Text>
        <Text style={styles.subTitle}>3.8. Các nội dung khác</Text>
        <Text style={styles.paragraph}>Các nội dung khác liên quan đến Xử lý dữ liệu cá nhân chưa được thể hiện tại Điều Khoản Chung này thì áp dụng theo các văn bản pháp luật hiện hành.</Text>

        <Text style={styles.title}>Điều 4. Quyền và nghĩa vụ của Chủ thể dữ liệu liên quan đến Dữ liệu cá nhân cung cấp cho ESG</Text>
        <Text style={styles.paragraph}>4.1.    Chủ thể dữ liệu có các quyền sau đây: (i) Quyền được biết; (ii) Quyền đồng ý; (iii) Quyền truy cập; (iv) Quyền rút lại sự đồng ý; (v) Quyền xóa dữ liệu; (vi) Quyền hạn chế xử lý dữ liệu; (vii) Quyền cung cấp dữ liệu; (viii) Quyền phản đối xử lý dữ liệu; (ix) Quyền khiếu nại, tố cáo, khởi kiện; (x) Quyền yêu cầu bồi thường thiệt hại; (xi) Quyền tự bảo vệ; và (xii) các quyền có liên quan khác theo quy định của pháp luật. Nội dung cụ thể của các quyền nêu trên tuân thủ theo quy định của pháp luật hiện hành.</Text>
        <Text style={styles.paragraph}>4.2.   ESG bằng sự nỗ lực hợp lý, sẽ thực hiện yêu cầu hợp pháp và hợp lệ từ Chủ thể dữ liệu trong khoảng thời gian luật định kể từ khi nhận được yêu cầu hoàn chỉnh, hợp lệ và phí xử lý liên quan (nếu có) từ Chủ thể dữ liệu, phụ thuộc vào quyền của ESG khi được viện dẫn đến bất kỳ sự miễn trừ và/hoặc ngoại lệ nào theo quy định pháp luật;</Text>
        <Text style={styles.paragraph}>4.3.    Trong trường hợp Chủ thể dữ liệu rút lại sự đồng ý của mình, yêu cầu xóa dữ liệu, hạn chế xử lý dữ liệu và/hoặc thực hiện các quyền có liên quan khác đối với bất kỳ hoặc tất cả các Dữ liệu cá nhân của mình, và tuỳ thuộc vào bản chất yêu cầu của Chủ thể dữ liệu, ESG có thể sẽ xem xét và quyết định về việc không tiếp tục thực hiện giao dịch hoặc không tiếp tục cung cấp các sản phẩm, dịch vụ có liên quan đến việc sử dụng Dữ liệu cá nhân của Khách hàng/Chủ thể dữ liệu do không thể đảm bảo tiêu chuẩn/chất lượng của sản phẩm, dịch vụ theo đánh giá của ESG hoặc do quy định của pháp luật cần phải thu thập Dữ liệu cá nhân liên quan khi cung cấp sản phẩm, dịch vụ. Các hành vi được thực hiện theo quy định này được xem là sự đơn phương chấm dứt giao dịch từ phía Chủ thể dữ liệu/Khách hàng cho bất kỳ mối quan hệ nào với ESG và hoàn toàn có thể dẫn đến sự vi phạm nghĩa vụ hoặc các cam kết theo các văn bản, thỏa thuận giữa Chủ thể dữ liệu/Khách hàng với ESG. Khi phát sinh tình huống này, ESG sẽ thông báo đến Chủ thể dữ liệu/Khách hàng về việc chấm dứt sản phẩm, dịch vụ và Khách hàng/Chủ thể dữ liệu hoàn toàn chịu trách nhiệm đối với mọi thiệt hại phát sinh có liên quan.
          Khách hàng/Chủ thể dữ liệu cần lưu ý, do đặc thù hoạt động của ESG, trong trường hợp pháp luật có quy định ESG phải lưu trữ Dữ liệu cá nhân trong một số trường hợp nhất định thì ESG không thể đáp ứng yêu cầu xóa dữ liệu của Chủ thể dữ liệu có liên quan nếu việc xóa dữ liệu dẫn đến vi phạm pháp luật;</Text>
        <Text style={styles.paragraph}>4.4.    Vì mục đích bảo mật, Chủ thể dữ liệu có thể cần phải đưa ra yêu cầu của mình bằng văn bản hoặc sử dụng phương pháp khác để chứng minh và xác thực danh tính của Chủ thể dữ liệu. ESG có thể yêu cầu Chủ thể dữ liệu xác minh danh tính trước khi xử lý yêu cầu của Chủ thể dữ liệu;</Text>
        <Text style={styles.paragraph}>4.5.    Chủ thể dữ liệu có trách nhiệm tự bảo vệ Dữ liệu cá nhân của mình, yêu cầu các tổ chức, cá nhân khác có liên quan bảo vệ Dữ liệu cá nhân của mình. Đồng thời, Chủ thể dữ liệu sẽ tôn trọng và bảo vệ Dữ liệu cá nhân của người khác;</Text>
        <Text style={styles.paragraph}>4.6.    Chủ thể dữ liệu cung cấp đầy đủ, chính xác Dữ liệu cá nhân cho ESG khi giao kết hợp đồng hoặc sử dụng dịch vụ do ESG cung cấp;</Text>
        <Text style={styles.paragraph}>4.7.    Chủ thể dữ liệu thực hiện và tuân thủ quy định của pháp luật về bảo vệ Dữ liệu cá nhân và tham gia phòng, chống các hành vi vi phạm quy định về bảo vệ Dữ liệu cá nhân;</Text>
        <Text style={styles.paragraph}>4.8.    Trong trường hợp có sự thay đổi, điều chỉnh Dữ liệu cá nhân, Chủ thể dữ liệu/Bên cung cấp dữ liệu cá nhân và/hoặc bên có liên quan có trách nhiệm liên hệ và thông báo ngay cho ESG để ESG thực hiện cập nhật kịp thời những thay đổi, điều chỉnh đó. Chủ thể dữ liệu/Bên cung cấp dữ liệu cá nhân và/hoặc bên có liên quan sẽ chịu trách nhiệm toàn bộ đối với việc chậm trễ thông báo này; đồng thời, việc chậm trễ thông báo này sẽ miễn trừ cho ESG khỏi mọi thiệt hại, rủi ro phát sinh (nếu có);</Text>
        <Text style={styles.paragraph}>4.9     Chủ thể dữ liệu cập nhật thông tin đăng tải trên trang điện tử của ESG tại https://ensogo.vn/bao-mat và thực hiện theo bất kỳ thay đổi nào (nếu có) liên quan đến Điều Khoản Chung này;</Text>
        <Text style={styles.paragraph}>4.10.   Chủ thể dữ liệu thông báo ngay tới ESG nếu phát hiện hoặc nghi ngờ Dữ liệu cá nhân bị lộ, có thể dẫn tới rủi ro trong quá trình sử dụng sản phẩm, dịch vụ, hoặc bất kỳ vi phạm nào về bảo vệ Dữ liệu cá nhân theo Điều Khoản Chung này mà Chủ thể dữ liệu có thể nhận biết được;</Text>
        <Text style={styles.paragraph}>4.11.   Chủ thể dữ liệu hiểu và đồng ý rằng, ESG có quyền từ chối thực hiện các yêu cầu của Chủ thể dữ liệu trong một số trường hợp, bao gồm nhưng không giới hạn ở: (i) Chủ thể dữ liệu không thực hiện đúng trình tự, thủ tục do ESG hướng dẫn; (ii) Chủ thể dữ liệu không cung cấp hoặc cung cấp không đầy đủ các giấy tờ, tài liệu để xác minh danh tính; hoặc (iii) trong trường hợp ESG đánh giá có dấu hiệu gian lận, vi phạm về bảo vệ Dữ liệu cá nhân; hoặc (iv) quy định của pháp luật không cho phép thực hiện yêu cầu của Chủ thể dữ liệu;</Text>
        <Text style={styles.paragraph}>4.12.   Chủ thể dữ liệu xác nhận rằng, bằng việc chấp nhận Điều Khoản Chung này, Chủ thể dữ liệu đã được ESG thông báo, đã biết rõ và đồng ý với toàn bộ các nội dung cần được thông báo trước khi ESG xử lý Dữ liệu cá nhân, chi tiết như quy định tại Điều Khoản Chung này. Chủ thể dữ liệu đồng ý rằng ESG không cần thực hiện thông báo lại trước khi xử lý Dữ liệu cá nhân.</Text>

        <Text style={styles.title}>Điều 5. Rủi ro khi bị lộ Dữ liệu cá nhân và biện pháp bảo vệ</Text>
        <Text style={styles.paragraph}>5.1.    Chủ thể dữ liệu đồng ý rằng xử lý Dữ liệu cá nhân sẽ luôn tồn tại những rủi ro tiềm tàng do lỗi của hệ thống, đường truyền, sự kiện bất khả kháng, virut, tấn công mạng hoặc lỗi phần cứng, phần mềm, các hành động, thao tác của Khách hàng/Chủ thể dữ liệu hoặc bất kỳ bên thứ ba nào khác ảnh hưởng đến việc cung cấp và xử lý Dữ liệu cá nhân của Chủ thể dữ liệu…. Các rủi có thể phát sinh như việc Dữ liệu cá nhân có thể bị lộ hoặc bị đánh cắp bởi một bên khác dẫn đến việc các Dữ liệu cá nhân này có thể được sử dụng vào những mục đích không mong muốn hoặc nằm ngoài tầm kiểm soát của ESG và Chủ thể dữ liệu gây ra những tổn thất cả về vật chất và tinh thần.</Text>
        <Text style={styles.paragraph}>5.2.    ESG xem các Dữ liệu cá nhân như là tài sản quan trọng nhất của ESG và ESG luôn cố gắng đảm bảo tính bảo mật, an toàn, tuân thủ pháp luật, hạn chế các hậu quả, thiệt hại không mong muốn có khả năng xảy ra.</Text>
        <Text style={styles.paragraph}>5.3.    Trách nhiệm bảo mật Dữ liệu cá nhân là yêu cầu bắt buộc ESG đặt ra cho toàn thể nhân viên. ESG thực hiện trách nhiệm bảo vệ Dữ liệu cá nhân theo quy định của pháp luật hiện hành với các phương pháp bảo mật tốt nhất theo quy định pháp luật và thường xuyên xem xét, cập nhật các biện pháp quản lý và kỹ thuật khi xử lý Dữ liệu cá nhân (nếu có).</Text>

        <Text style={styles.title}>Điều 6. Lưu trữ Dữ liệu cá nhân</Text>
        <Text style={styles.paragraph}>6.1.    Dữ liệu cá nhân do ESG lưu trữ sẽ được bảo mật. ESG sẽ thực hiện các biện pháp hợp lý để bảo vệ Dữ liệu cá nhân khi được lưu trữ tại ESG.</Text>
        <Text style={styles.paragraph}>6.2.    ESG lưu trữ Dữ liệu cá nhân trong khoảng thời gian cần thiết để hoàn thành các mục đích theo các văn bản mà các bên có liên quan đã ký với ESG và theo Điều Khoản Chung này, trừ khi thời gian lưu trữ Dữ liệu cá nhân lâu hơn nếu được yêu cầu hoặc cho phép bởi (các) bên có liên quan và các quy định pháp luật hiện hành.</Text>

        <Text style={styles.title}>Điều 7. Sửa đổi, bổ sung Điều Khoản Chung</Text>
        <Text style={styles.paragraph}>ESG có thể sửa đổi, bổ sung các nội dung của Điều Khoản Chung này tùy từng thời điểm và đảm bảo việc sửa đổi, bổ sung phù hợp với các quy định có liên quan của pháp luật. Thông báo về bất kỳ sự sửa đổi, bổ sung nào sẽ được cập nhật, đăng tải trên trang điện tử của ESG  tại https://ensogo.vn/bao-mat và/hoặc thông báo đến Chủ thể dữ liệu/Khách hàng hoặc các bên liên quan thông qua các phương tiện liên lạc mà ESG cho là phù hợp.</Text>
        <Text style={styles.paragraph}>Trong phạm vi được pháp luật hiện hành cho phép, việc Khách hàng hoặc các bên liên quan tiếp tục sử dụng các dịch vụ, sản phẩm của ESG; hoặc tiếp tục duy trì các giao dịch, thỏa thuận với ESG đồng nghĩa với việc Chủ thể dữ liệu/Khách hàng/các bên liên quan đồng ý với các nội dung sửa đổi, bổ sung của Điều Khoản Chung này mà không kèm theo bất kỳ điều kiện nào.</Text>

        <Text style={styles.title}>Điều 8. Thông tin liên hệ xử lý Dữ liệu cá nhân</Text>
        <Text style={styles.paragraph}>Mọi thắc mắc liên quan đến việc ESG xử lý Dữ liệu cá nhân của Chủ thể dữ liệu, vui lòng liên hệ theo thông tin dưới đây:</Text>
        <Text style={styles.listItem}>•	Đối với Khách hàng: Tổng đài ESG Contact Center 1900.......</Text>
        <Text style={styles.listItem}>•	Đối với ứng viên, cộng tác viên, người lao động: Phòng Nhân sự của ESG</Text>
        <Text style={styles.listItem}>•	Đối với các bên cung cấp dịch vụ, đối tác khác: theo thông tin đầu mối liên hệ tại các văn bản, thỏa thuận có liên quan.</Text>

        <Text style={styles.title}>Điều 9. Điều khoản về Chấp thuận</Text>
        <Text style={styles.paragraph}>9.1.    Khi sử dụng bất kỳ dịch vụ, sản phẩm hoặc truy cập bất kỳ trang tin điện tử, ứng dụng hoặc thiết bị của ESG hoặc được kết nối đến ESG, hoặc xác lập giao dịch hoặc cho phép ESG xử lý Dữ liệu cá nhân (trực tiếp hoặc thông qua bên thứ ba), Chủ thể dữ liệu/Khách hàng được coi là đã chấp nhận và không kèm theo bất kỳ điều kiện nào đối với các chính sách được đề cập tại Điều Khoản Chung này và các thay đổi (nếu có) trong từng thời kỳ.</Text>
        <Text style={styles.paragraph}>9.2.    Điều Khoản Chung này là một phần không thể tách rời và cần được đọc, hiểu thống nhất với các hợp đồng, thỏa thuận, đề nghị, cam kết, đăng ký sử dụng sản phẩm, dịch vụ được xác lập giữa Chủ thể dữ liệu/Khách hàng/Bên cung cấp Dữ liệu cá nhân và ESG. Điều Khoản Chung sẽ được ưu tiên áp dụng trong trường hợp có bất kỳ xung đột hoặc mâu thuẫn nào với các hợp đồng, thỏa thuận, đề nghị, cam kết, đăng ký sử dụng sản phẩm, dịch vụ chi phối mối quan hệ của Chủ thể dữ liệu/Khách hàng/Bên cung cấp Dữ liệu cá nhân với ESG, cho dù được ký kết trước, vào ngày hoặc sau ngày Chủ thể dữ liệu/Khách hàng/Bên cung cấp Dữ liệu cá nhân Điều Khoản Chung này.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  mainTitle: {
    // fontSize: 18,
    ...typography.title,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,

    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,

    color: colors.text.primary,
    marginTop: 12,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 22,
    textAlign: 'justify',
    marginBottom: 8,
  },
  listItem: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 22,
    textAlign: 'justify',
    marginLeft: 16,
    marginBottom: 4,
  },
});
