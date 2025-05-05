package com.hszadkowski.iwa_backend.config;


import com.hszadkowski.iwa_backend.models.AppUser;
import com.hszadkowski.iwa_backend.repos.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MakeUpUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AppUser appUser = userRepository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("User details not found for user: " + username));

        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(appUser.getRole()));
        return new User(appUser.getEmail(), appUser.getPasswordHash(), authorities);

    }


}
