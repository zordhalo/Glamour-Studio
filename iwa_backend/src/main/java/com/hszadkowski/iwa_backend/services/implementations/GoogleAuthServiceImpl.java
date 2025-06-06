package com.hszadkowski.iwa_backend.services.implementations;

import com.hszadkowski.iwa_backend.dto.GoogleUserDto;
import com.hszadkowski.iwa_backend.services.interfaces.GoogleAuthService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@Slf4j
public class GoogleAuthServiceImpl implements GoogleAuthService {

    @Value("${google.auth.client.id}")
    private String googleClientId;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public boolean validateGoogleToken(String accessToken) {
        String url = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" + accessToken;

        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> tokenInfo = response.getBody();
                String audience = (String) tokenInfo.get("audience"); // audience token need to coresspond to the app corelated with auth, in the future probably frontend app

                return googleClientId.equals(audience);
            }
            return false;
        } catch (Exception e) {
            log.error("Error validating Google token: ", e);
            return false;
        }
    }

    @Override
    public GoogleUserDto getGoogleUserInfo(String accessToken) {
        String url = "https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + accessToken;

        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                GoogleUserDto googleUser = getGoogleUserDto(accessToken, response);

                return googleUser;
            }
            return null;
        } catch (Exception e) {
            log.error("Error getting Google user info: ", e);
            return null;
        }
    }

    private static GoogleUserDto getGoogleUserDto(String accessToken, ResponseEntity<Map> response) {
        Map<String, Object> userInfo = response.getBody();

        GoogleUserDto googleUser = new GoogleUserDto();
        googleUser.setId((String) userInfo.get("id"));
        googleUser.setEmail((String) userInfo.get("email"));
        googleUser.setName((String) userInfo.get("name"));
        googleUser.setGivenName((String) userInfo.get("given_name"));
        googleUser.setFamilyName((String) userInfo.get("family_name"));
        googleUser.setAccessToken(accessToken);
        return googleUser;
    }
}
